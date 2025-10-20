sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
],
function (Controller, MessageToast, MessageBox, JSONModel) {
    "use strict";

    return Controller.extend("employees.controller.EmployeeCreate", {
        onInit: function () {
            this.__initValidationModel();
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
        
        /**
         * Save Data in SAP GUI Table 
         * 1: Get Model 'mainService' From Manifest.json --- Two way Binding
         * 2: Call Private Function _getPayload
         * 3: Call OData Create with handle if Success or failed
         */
        onSave: function () {

            if (this._validateInputs()) {
                 var oModel = this.getOwnerComponent().getModel(); //Defualt Model in Manifest.json *mainService*                    
            
                 var oPayload = this._getPayload();
                // Call OData Create
                oModel.create("/EMPLOYEESSet", oPayload, {
                    success: function () {
                        MessageToast.show("Employee Created Successfully");
                    },
                    error: function (oError) {
                    MessageBox.error("Error: " + oError.message);
                    }
                });
            } else {
                MessageToast.show("Please fix the validation errors.");
            }            
           
        },

        /**
         * Fetch all field from inputs by use Id
         * @returns oPayload
         */
        _getPayload: function() {
//* ---------------------------------------------------------------------------------------------------- *//           
            // --- Read Values ---
            // --- Fetch Reqired Data---
            var sFirstName     = this.byId("idFirstName").getValue();
            var sLastName      = this.byId("idLastName").getValue();
            var sFullName      = sFirstName + " " + sLastName;

            var dDob           = this.byId("idDob").getDateValue();   // Date object
            var dJoinDate      = this.byId("idJoinDate").getDateValue();

            var sPosition      = this.byId("idPosition").getValue();
            var sMaritalStatus = this.byId("idMaritalStatus").getSelectedKey();
            //RadioButton
            var sGenderIndex   = this.byId("groupE").getSelectedIndex(); // return Key 1
            let sGender = '';
            if (sGenderIndex === 0) {
                sGender = 'M';
            }else if(sGenderIndex === 1) {
                sGender = 'F';
            }
            var sGenderText    = this.byId("groupE").getSelectedButton().getText(); // return text
//* ---------------------------------------------------------------------------------------------------- *//  
            // --- Fetch Optional Data ---
            var sNationalId    = this.byId("idNationalId").getValue();
            var sSalary        = this.byId("idSalary").getValue();
            if (sSalary === "") {
                sSalary = 1;
            }
            var sEmail         = this.byId("idEmail").getValue();
            var sPhone         = this.byId("idPhone").getValue();
            var sAddress       = this.byId("idAddress").getValue();
//* ---------------------------------------------------------------------------------------------------- *// 
            //Handl Date -- In SAP => Edm.DateTime
            dDob.setUTCHours(0,0,0,0);
            dJoinDate.setUTCHours(0,0,0,0);
            var dobEpoch = "/Date(" + dDob.getTime() + ")/";
            var joinEpoch = "/Date(" + dJoinDate.getTime() + ")/";
//* ---------------------------------------------------------------------------------------------------- *//              
            // --- Build Payload ---
            var oPayload = {
                FirstName: sFirstName,
                LastName: sLastName,
                FullName: sFullName,
                Dob: dobEpoch,
                JoinDate: joinEpoch,
                Positions: sPosition,
                MaritalStatus: sMaritalStatus,   // e.g. "M" / "S"
                Gender: sGender,             // or use sGenderIndex if DB expects number
                NationalId: sNationalId,
                Salary: sSalary,
                Email: sEmail,
                Phone: sPhone,
                Address: sAddress,
                Status: "A",
                CreatedBy: "YOUSSEF",
                CreatedOn: "/Date(" + new Date().getTime() + ")/",
                ChangedBy: "YOUSSEF",
                ChangedOn: "/Date(" + new Date().getTime() + ")/"
            };

            return oPayload;
      },

    /**
     * _initModel
     * ----------------------------
     * Initialize JSON model with default values and states
     * for all input fields in the form.
     * @returns oModelValidate
     */
      __initValidationModel: function() {

        var aInputs = ["FirstName", "LastName", "Positions", "MaritalStatus", "Dob", "JoinDate"];

        let oValidate = {};

        aInputs.forEach(function(sInput) {
            oValidate[sInput] = "";
            oValidate[sInput + "State"] = "None";   
            oValidate[sInput + "StateText"] = "";   
        });

        var oModelValidate = new JSONModel(oValidate);
        this.getView().setModel(oModelValidate);

        return oModelValidate;
    },

    _validateInputs: function() {

        var oModel = this.getView().getModel();
        var bValid = true;

        var aInputs = ["FirstName", "LastName", "Positions", "MaritalStatus", "Dob", "JoinDate"];

        aInputs.forEach(function(sInput) {
            var sValue = oModel.getProperty("/" + sInput);

            if (!sValue || sValue.trim() === "") {
                oModel.setProperty("/" + sInput + "State", "Error");
                oModel.setProperty("/" + sInput + "StateText", "Please enter " + sInput);
                bValid = false;
            } else {
                oModel.setProperty("/" + sInput + "State", "None");
                oModel.setProperty("/" + sInput + "StateText", "");
            }
        });

        return bValid;        
    }

                    
    });
});
