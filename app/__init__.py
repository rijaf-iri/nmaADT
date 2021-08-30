
from flask import Flask, render_template, flash
import datetime
from flask_jsglue import JSGlue

# Define the WSGI application object
app = Flask(__name__, instance_relative_config=False)

# Configurations
app.config.from_object("config")

jsglue = JSGlue(app)

# @app.route("/hello")
# def hello():
#     return render_template("hello.html")

# HTTP error handling
@app.errorhandler(404)
def not_found(error):
    return render_template("404.html"), 404

@app.route("/")
def homepage():
    flash("Welcome to National Meteorology Agency", "info")
    return render_template("main.html", error_login=False)

@app.context_processor
def utility_processor():
    def date_now(format="%d.%m.%Y %H:%M:%S"):
        return datetime.datetime.now().strftime(format)

    return dict(date_now=date_now)

## Import applications
from app.mod_auth.usersManagement import mod_auth as auth_module
from app.mod_aws.awsDataDisplay import mod_aws as aws_module

## Register Blueprints
app.register_blueprint(auth_module)
app.register_blueprint(aws_module)
