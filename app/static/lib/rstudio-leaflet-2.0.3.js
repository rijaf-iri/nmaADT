// Copied from
// https://github.com/rstudio/leaflet/blob/master/javascript/src/mipmapper.js

class Mipmapper {
    constructor(img) {
        this._layers = [img];
    }

    // The various functions on this class take a callback function BUT MAY OR MAY
    // NOT actually behave asynchronously.
    getBySize(desiredWidth, desiredHeight, callback) {
        let i = 0;
        let lastImg = this._layers[0];
        let testNext = () => {
            this.getByIndex(i, function(img) {
                // If current image is invalid (i.e. too small to be rendered) or
                // it's smaller than what we wanted, return the last known good image.
                if (!img || img.width < desiredWidth || img.height < desiredHeight) {
                    callback(lastImg);
                    return;
                } else {
                    lastImg = img;
                    i++;
                    testNext();
                    return;
                }
            });
        };
        testNext();
    }

    getByIndex(i, callback) {
        if (this._layers[i]) {
            callback(this._layers[i]);
            return;
        }

        this.getByIndex(i - 1, (prevImg) => {
            if (!prevImg) {
                // prevImg could not be calculated (too small, possibly)
                callback(null);
                return;
            }
            if (prevImg.width < 2 || prevImg.height < 2) {
                // Can't reduce this image any further
                callback(null);
                return;
            }
            // If reduce ever becomes truly asynchronous, we should stuff a promise or
            // something into this._layers[i] before calling this.reduce(), to prevent
            // redundant reduce operations from happening.
            this.reduce(prevImg, (reducedImg) => {
                this._layers[i] = reducedImg;
                callback(reducedImg);
                return;
            });
        });
    }

    reduce(img, callback) {
        let imgDataCanvas = document.createElement("canvas");
        imgDataCanvas.width = Math.ceil(img.width / 2);
        imgDataCanvas.height = Math.ceil(img.height / 2);
        imgDataCanvas.style.display = "none";
        document.body.appendChild(imgDataCanvas);
        try {
            let imgDataCtx = imgDataCanvas.getContext("2d");
            imgDataCtx.drawImage(img, 0, 0, img.width / 2, img.height / 2);
            callback(imgDataCanvas);
        } finally {
            document.body.removeChild(imgDataCanvas);
        }
    }
}

/////////////////////////////////
// Copied from
// https://github.com/rstudio/leaflet/blob/master/javascript/src/methods.js

function addRasterImage(uri, bounds, opacity) {
    // uri is a data URI containing an image. We want to paint this image as a
    // layer at (top-left) bounds[0] to (bottom-right) bounds[1].

    // We can't simply use ImageOverlay, as it uses bilinear scaling which looks
    // awful as you zoom in (and sometimes shifts positions or disappears).
    // Instead, we'll use a TileLayer.Canvas to draw pieces of the image.

    // First, some helper functions.

    // degree2tile converts latitude, longitude, and zoom to x and y tile
    // numbers. The tile numbers returned can be non-integral, as there's no
    // reason to expect that the lat/lng inputs are exactly on the border of two
    // tiles.
    //
    // We'll use this to convert the bounds we got from the server, into coords
    // in tile-space at a given zoom level. Note that once we do the conversion,
    // we don't to do any more trigonometry to convert between pixel coordinates
    // and tile coordinates; the source image pixel coords, destination canvas
    // pixel coords, and tile coords all can be scaled linearly.
    function degree2tile(lat, lng, zoom) {
        // See http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
        let latRad = lat * Math.PI / 180;
        let n = Math.pow(2, zoom);
        let x = (lng + 180) / 360 * n;
        let y = (1 - Math.log(Math.tan(latRad) + (1 / Math.cos(latRad))) / Math.PI) / 2 * n;
        return { x: x, y: y };
    }

    // Given a range [from,to) and either one or two numbers, returns true if
    // there is any overlap between [x,x1) and the range--or if x1 is omitted,
    // then returns true if x is within [from,to).
    function overlap(from, to, x, /* optional */ x1) {
        if (arguments.length == 3)
            x1 = x;
        return x < to && x1 >= from;
    }

    function getCanvasSmoothingProperty(ctx) {
        let candidates = ["imageSmoothingEnabled", "mozImageSmoothingEnabled",
            "webkitImageSmoothingEnabled", "msImageSmoothingEnabled"
        ];
        for (let i = 0; i < candidates.length; i++) {
            if (typeof(ctx[candidates[i]]) !== "undefined") {
                return candidates[i];
            }
        }
        return null;
    }

    // Our general strategy is to:
    // 1. Load the data URI in an Image() object, so we can get its pixel
    //    dimensions and the underlying image data. (We could have done this
    //    by not encoding as PNG at all but just send an array of RGBA values
    //    from the server, but that would inflate the JSON too much.)
    // 2. Create a hidden canvas that we use just to extract the image data
    //    from the Image (using Context2D.getImageData()).
    // 3. Create a TileLayer.Canvas and add it to the map.

    // We want to synchronously create and attach the TileLayer.Canvas (so an
    // immediate call to clearRasters() will be respected, for example), but
    // Image loads its data asynchronously. Fortunately we can resolve this
    // by putting TileLayer.Canvas into async mode, which will let us create
    // and attach the layer but have it wait until the image is loaded before
    // it actually draws anything.

    // These are the variables that we will populate once the image is loaded.
    let imgData = null; // 1d row-major array, four [0-255] integers per pixel
    let imgDataMipMapper = null;
    let w = null; // image width in pixels
    let h = null; // image height in pixels

    // We'll use this array to store callbacks that need to be invoked once
    // imgData, w, and h have been resolved.
    let imgDataCallbacks = [];

    // Consumers of imgData, w, and h can call this to be notified when data
    // is available.
    function getImageData(callback) {
        if (imgData != null) {
            // Must not invoke the callback immediately; it's too confusing and
            // fragile to have a function invoke the callback *either* immediately
            // or in the future. Better to be consistent here.
            setTimeout(() => {
                callback(imgData, w, h, imgDataMipMapper);
            }, 0);
        } else {
            imgDataCallbacks.push(callback);
        }
    }

    let img = new Image();
    img.onload = function() {
        // Save size
        w = img.width;
        h = img.height;

        // Create a dummy canvas to extract the image data
        let imgDataCanvas = document.createElement("canvas");
        imgDataCanvas.width = w;
        imgDataCanvas.height = h;
        imgDataCanvas.style.display = "none";
        document.body.appendChild(imgDataCanvas);

        let imgDataCtx = imgDataCanvas.getContext("2d");
        imgDataCtx.drawImage(img, 0, 0);

        // Save the image data.
        imgData = imgDataCtx.getImageData(0, 0, w, h).data;
        imgDataMipMapper = new Mipmapper(img);

        // Done with the canvas, remove it from the page so it can be gc'd.
        document.body.removeChild(imgDataCanvas);

        // Alert any getImageData callers who are waiting.
        for (let i = 0; i < imgDataCallbacks.length; i++) {
            imgDataCallbacks[i](imgData, w, h, imgDataMipMapper);
        }
        imgDataCallbacks = [];
    };
    img.src = uri;

    let canvasTiles = L.gridLayer({
        opacity: opacity,
        detectRetina: true,
        async: true
    });

    // NOTE: The done() function MUST NOT be invoked until after the current
    // tick; done() looks in Leaflet's tile cache for the current tile, and
    // since it's still being constructed, it won't be found.
    canvasTiles.createTile = function(tilePoint, done) {
        let zoom = tilePoint.z;
        let canvas = L.DomUtil.create("canvas");
        let error;

        // setup tile width and height according to the options
        var size = this.getTileSize();
        canvas.width = size.x;
        canvas.height = size.y;

        getImageData(function(imgData, w, h, mipmapper) {
            try {
                // The Context2D we'll being drawing onto. It's always 256x256.
                let ctx = canvas.getContext("2d");

                // Convert our image data's top-left and bottom-right locations into
                // x/y tile coordinates. This is essentially doing a spherical mercator
                // projection, then multiplying by 2^zoom.
                let topLeft = degree2tile(bounds[0][0], bounds[0][1], zoom);
                let bottomRight = degree2tile(bounds[1][0], bounds[1][1], zoom);
                // The size of the image in x/y tile coordinates.
                let extent = { x: bottomRight.x - topLeft.x, y: bottomRight.y - topLeft.y };

                // Short circuit if tile is totally disjoint from image.
                if (!overlap(tilePoint.x, tilePoint.x + 1, topLeft.x, bottomRight.x))
                    return;
                if (!overlap(tilePoint.y, tilePoint.y + 1, topLeft.y, bottomRight.y))
                    return;

                // The linear resolution of the tile we're drawing is always 256px per tile unit.
                // If the linear resolution (in either direction) of the image is less than 256px
                // per tile unit, then use nearest neighbor; otherwise, use the canvas's built-in
                // scaling.
                let imgRes = {
                    x: w / extent.x,
                    y: h / extent.y
                };

                // We can do the actual drawing in one of three ways:
                // - Call drawImage(). This is easy and fast, and results in smooth
                //   interpolation (bilinear?). This is what we want when we are
                //   reducing the image from its native size.
                // - Call drawImage() with imageSmoothingEnabled=false. This is easy
                //   and fast and gives us nearest-neighbor interpolation, which is what
                //   we want when enlarging the image. However, it's unsupported on many
                //   browsers (including QtWebkit).
                // - Do a manual nearest-neighbor interpolation. This is what we'll fall
                //   back to when enlarging, and imageSmoothingEnabled isn't supported.
                //   In theory it's slower, but still pretty fast on my machine, and the
                //   results look the same AFAICT.

                // Is imageSmoothingEnabled supported? If so, we can let canvas do
                // nearest-neighbor interpolation for us.
                let smoothingProperty = getCanvasSmoothingProperty(ctx);

                if (smoothingProperty || imgRes.x >= 256 && imgRes.y >= 256) {
                    // Use built-in scaling

                    // Turn off anti-aliasing if necessary
                    if (smoothingProperty) {
                        ctx[smoothingProperty] = imgRes.x >= 256 && imgRes.y >= 256;
                    }

                    // Don't necessarily draw with the full-size image; if we're
                    // downscaling, use the mipmapper to get a pre-downscaled image
                    // (see comments on Mipmapper class for why this matters).
                    mipmapper.getBySize(extent.x * 256, extent.y * 256, function(mip) {
                        // It's possible that the image will go off the edge of the canvas--
                        // that's OK, the canvas should clip appropriately.
                        ctx.drawImage(mip,
                            // Convert abs tile coords to rel tile coords, then *256 to convert
                            // to rel pixel coords
                            (topLeft.x - tilePoint.x) * 256,
                            (topLeft.y - tilePoint.y) * 256,
                            // Always draw the whole thing and let canvas clip; so we can just
                            // convert from size in tile coords straight to pixels
                            extent.x * 256,
                            extent.y * 256
                        );
                    });

                } else {
                    // Use manual nearest-neighbor interpolation

                    // Calculate the source image pixel coordinates that correspond with
                    // the top-left and bottom-right of this tile. (If the source image
                    // only partially overlaps the tile, we use max/min to limit the
                    // sourceStart/End to only reflect the overlapping portion.)
                    let sourceStart = {
                        x: Math.max(0, Math.floor((tilePoint.x - topLeft.x) * imgRes.x)),
                        y: Math.max(0, Math.floor((tilePoint.y - topLeft.y) * imgRes.y))
                    };
                    let sourceEnd = {
                        x: Math.min(w, Math.ceil((tilePoint.x + 1 - topLeft.x) * imgRes.x)),
                        y: Math.min(h, Math.ceil((tilePoint.y + 1 - topLeft.y) * imgRes.y))
                    };

                    // The size, in dest pixels, that each source pixel should occupy.
                    // This might be greater or less than 1 (e.g. if x and y resolution
                    // are very different).
                    let pixelSize = {
                        x: 256 / imgRes.x,
                        y: 256 / imgRes.y
                    };

                    // For each pixel in the source image that overlaps the tile...
                    for (let row = sourceStart.y; row < sourceEnd.y; row++) {
                        for (let col = sourceStart.x; col < sourceEnd.x; col++) {
                            // ...extract the pixel data...
                            let i = ((row * w) + col) * 4;
                            let r = imgData[i];
                            let g = imgData[i + 1];
                            let b = imgData[i + 2];
                            let a = imgData[i + 3];
                            ctx.fillStyle = "rgba(" + [r, g, b, a / 255].join(",") + ")";

                            // ...calculate the corresponding pixel coord in the dest image
                            // where it should be drawn...
                            let pixelPos = {
                                x: (((col / imgRes.x) + topLeft.x) - tilePoint.x) * 256,
                                y: (((row / imgRes.y) + topLeft.y) - tilePoint.y) * 256
                            };

                            // ...and draw a rectangle there.
                            ctx.fillRect(
                                Math.round(pixelPos.x),
                                Math.round(pixelPos.y),
                                // Looks crazy, but this is necessary to prevent rounding from
                                // causing overlap between this rect and its neighbors. The
                                // minuend is the location of the next pixel, while the
                                // subtrahend is the position of the current pixel (to turn an
                                // absolute coordinate to a width/height). Yes, I had to look
                                // up minuend and subtrahend.
                                Math.round(pixelPos.x + pixelSize.x) - Math.round(pixelPos.x),
                                Math.round(pixelPos.y + pixelSize.y) - Math.round(pixelPos.y));
                        }
                    }
                }
            } catch (e) {
                error = e;
            } finally {
                done(error, canvas);
            }
        });
        return canvas;
    };

    return canvasTiles;
};