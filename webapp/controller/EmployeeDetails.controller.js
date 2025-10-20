sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"

],
function (Controller, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("employees.controller.EmployeeDetails", {
        onInit: function () {
            var oRouter =  this.getOwnerComponent().getRouter();
            oRouter.getRoute('EmployeeDetails').attachPatternMatched(this._onObjectMatched, this);
        },

        onNavBack: function () {
            var oHistory = sap.ui.core.routing.History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                // Go back to the previous page in the browser history
                window.history.go(-1);
            } else {
                // If no history, navigate to a default route
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteView1", {}, true);
            }
        },
        _onObjectMatched: function(oEvent) {
            var oEmployeeId = oEvent.getParameter("arguments").employeeId;

            var oModel = this.getView().getModel(); // OData Model from manifest
            var sPath = "/EMPLOYEESSet(EmpId='" + oEmployeeId + "')"; // Key-based path
            const oView = this.getView();//Catch Edit-View
            oView.setBusy(true);//Start loading
            var that = this;
            oModel.read(sPath, {
                success: function (oData) {
                oView.setBusy(false);//stop loading spinner

                const oEmployeeModel = new JSONModel(oData);// create local model
                // oView.setModel(oEmployeeModel, "employee");// bind it to the view
                oView.setModel(oEmployeeModel, "empData");
                // console.dir(oEmployeeModel.getData());
                // console.dir(oView.getModel("empData").getData());
                },
                error: function (oError) {
                try {
                    const response = JSON.parse(oError.responseText);//Convert JSON to Object to catch error
                    const errorMessage = response.error.message.value;//Catched Error 
                    sap.m.MessageBox.error(errorMessage); 
                } catch (e) {
                    sap.m.MessageBox.error("Unexpected error occurred while fetching data.");
                }
                }
            });
        }
    });
});
