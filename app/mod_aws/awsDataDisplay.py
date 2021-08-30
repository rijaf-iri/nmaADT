from flask import Blueprint, render_template, request, Response
from flask import current_app as app
from rpy2.robjects.packages import importr
import rpy2.robjects.vectors as rvect
import json
import tempfile
import os

import config
from app.mod_auth.usersManagement import login_required

#####################

mod_aws = Blueprint(
    "aws",
    __name__,
    template_folder="templates",
    static_folder="static",
    static_url_path="/static/mod_aws",
)

grdevices = importr("grDevices")
mtoadt = importr("mtoadt")

dirAWS = config.AWS_DATA_DIR

#####################

@mod_aws.route("/dispAWSCoordsPage")
def dispAWSCoords_page():
    return render_template("display-AWS-Coordinates.html")

@mod_aws.route("/dispAWSCoordsMap")
def dispAWSCoords_map():
    robj = mtoadt.readCoordsMap(dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/dispAWSMinDataPage")
def dispAWSMinData_page():
    return render_template("display-AWS-MinData.html")

@mod_aws.route("/readCoords")
def readCoords():
    robj = mtoadt.readCoords(dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/getAWSTimeRange")
def getAWSTimeRange():
    aws_id = request.args.get("id")
    aws_net = request.args.get("net")
    robj = mtoadt.getAWSTimeRange(aws_id, aws_net, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/chartMinAWSData")
def chartMinAWSData():
    net_aws = request.args.get("net_aws")
    var_hgt = request.args.get("var_hgt")
    stat = request.args.get("stat")
    start = request.args.get("start")
    end = request.args.get("end")
    plotrange = request.args.get("plotrange")
    robj = mtoadt.chartMinAWSData(
        net_aws, var_hgt, stat, start, end, plotrange, dirAWS
    )
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/mapMinAWSData")
def mapMinAWSData():
    time = request.args.get("time")
    # print(time)
    robj = mtoadt.mapMinAWSData(time, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/downAWSMinDataCSV")
@login_required
def downAWSMinDataCSV():
    net_aws = request.args.get("net_aws")
    var_hgt = request.args.get("var_hgt")
    start = request.args.get("start")
    end = request.args.get("end")
    robj = mtoadt.downAWSMinDataCSV(net_aws, var_hgt, start, end, dirAWS)
    pyobj = json.loads(robj[0])

    cd = "attachment; filename=" + pyobj['filename']
    downcsv = Response(
        pyobj['data'], mimetype="text/csv", headers={"Content-disposition": cd}
    )
    return downcsv

@mod_aws.route("/dispAWSAggrDataPage")
def dispAWSAggrData_page():
    return render_template("display-AWS-AggrData.html")

@mod_aws.route("/chartAggrAWSData")
def chartAggrAWSData():
    net_aws = request.args.get("net_aws")
    tstep = request.args.get("tstep")
    var_hgt = request.args.get("var_hgt")
    pars = request.args.get("pars")
    start = request.args.get("start")
    end = request.args.get("end")
    plotrange = request.args.get("plotrange")
    robj = mtoadt.chartAggrAWSData(
        tstep, net_aws, var_hgt, pars, start, end, plotrange, dirAWS
    )
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/mapAggrAWSData")
def mapAggrAWSData():
    time = request.args.get("time")
    tstep = request.args.get("tstep")
    robj = mtoadt.mapAggrAWSData(tstep, time, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/tableAggrAWSData")
@login_required
def tableAggrAWSData():
    net_aws = request.args.get("net_aws")
    tstep = request.args.get("tstep")
    start = request.args.get("start")
    end = request.args.get("end")
    robj = mtoadt.tableAggrAWSData(tstep, net_aws, start, end, dirAWS)
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)

@mod_aws.route("/downTableAggrCSV")
@login_required
def downTableAggrCSV():
    net_aws = request.args.get("net_aws")
    tstep = request.args.get("tstep")
    start = request.args.get("start")
    end = request.args.get("end")
    robj = mtoadt.downTableAggrCSV(tstep, net_aws, start, end, dirAWS)

    filename = tstep + "_" + net_aws + ".csv"
    cd = "attachment; filename=" + filename
    downcsv = Response(
        robj[0], mimetype="text/csv", headers={"Content-disposition": cd}
    )
    return downcsv

@mod_aws.route("/downAWSAggrOneVarCSV")
@login_required
def downAWSAggrOneVarCSV():
    net_aws = request.args.get("net_aws")
    var_hgt = request.args.get("var_hgt")
    tstep = request.args.get("tstep")
    start = request.args.get("start")
    end = request.args.get("end")
    robj = mtoadt.downAWSAggrOneVarCSV(tstep, net_aws, var_hgt, start, end, dirAWS)

    filename = tstep + "_" + var_hgt + "_" + net_aws + ".csv"
    cd = "attachment; filename=" + filename
    downcsv = Response(
        robj[0], mimetype="text/csv", headers={"Content-disposition": cd}
    )
    return downcsv

################ 
@mod_aws.route("/dispAWSAggrDataSelPage")
def dispAWSAggrDataSel_page():
    return render_template("display-AWS-AggrDataSel.html")

@mod_aws.route("/chartAggrAWSDataSel", methods=["POST"])
def chartAggrAWSDataSel():
    pars = request.get_json()
    # print(pars)
    # print(rvect.StrVector(pars["net_aws"]))
    robj = mtoadt.chartAggrAWSDataSel(
        pars["tstep"],
        rvect.StrVector(pars["net_aws"]),
        pars["var_hgt"],
        pars["pars"],
        pars["range"]["start"],
        pars["range"]["end"],
        dirAWS,
    )
    pyobj = json.loads(robj[0])
    # pyobj = {"opts":{"status": "no-data", "title": ""}}
    return json.dumps(pyobj)

@mod_aws.route("/tableAggrAWSDataSel", methods=["POST"])
@login_required
def tableAggrAWSDataSel():
    pars = request.get_json()
    robj = mtoadt.tableAggrAWSDataSel(
        pars["tstep"],
        rvect.StrVector(pars["net_aws"]),
        pars["var_hgt"],
        pars["pars"],
        pars["range"]["start"],
        pars["range"]["end"],
        dirAWS,
    )
    pyobj = json.loads(robj[0])
    return json.dumps(pyobj)
