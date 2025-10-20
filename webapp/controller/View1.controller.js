sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/library",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageToast",
    "sap/m/MessageBox"

],
function (Controller, coreLibrary, Dialog, Button, mobileLibrary, Text, Spreadsheet, MessageToast, MessageBox) {
    "use strict";

    // shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

    return Controller.extend("employees.controller.View1", {
        onInit: function () {
            // var oModel = this.getOwnerComponent().getModel("mainService");
            // this.getView().setModel(oModel);
            this._iLiveDelay = 400; // Milliseconds delay
            this._sSearchTimeout = null;
        },

        onRefresh: function() {
            this._refreshTable();
        },

                _refreshTable: function () {
            var oTable = this.byId("employeeTable");
            var oBinding = oTable.getBinding("items");

            if (oBinding) {
                // Remove all filters and sorters
                oBinding.filter([]);
                oBinding.sort([]);

                // Trigger new READ from OData Service
                oBinding.refresh();

                MessageToast.show("Data refreshed successfully!");
            } else {
                MessageToast.show("No binding found for table.");
            }
        },
        /**
         * Go To Create Page
         */
        onAddEmployee: function () {
           this.getOwnerComponent().getRouter().navTo('EmployeeCreate');
        },

        /**
         * Go To edit page by using ID 
         */
        onEditEmployee: function(oEvent) {

            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext();
            var oEmployeeId = oContext.getProperty('EmpId');

            // console.dir(oEmployeeId);
            this.getOwnerComponent().getRouter().navTo('EmployeeEdit', {
                employeeId: oEmployeeId  
            });
        },

        onItemPress: function(oEvent) {
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext();
            var oEmployeeId = oContext.getProperty('EmpId');

            // console.dir(oEmployeeId);
            this.getOwnerComponent().getRouter().navTo('EmployeeDetails', {
                employeeId: oEmployeeId  
            });
        },
        /**
         * LiveSearch
         */
        onReadSingleRow: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            clearTimeout(this._sSearchTimeout);

            this._sSearchTimeout = setTimeout(function () {
                var oTable = this.byId("employeeTable");
                var oBinding = oTable.getBinding("items");

                var aFilters = [];

                if (sQuery) {
                    aFilters.push(new sap.ui.model.Filter("EmpId", sap.ui.model.FilterOperator.Contains, sQuery));
                }
                // console.dir(aFilters);

                oBinding.filter(aFilters, "Application");

            }.bind(this), this._iLiveDelay);
        },


        onSearch: function () {
            var oTable = this.byId("employeeTable");
            var oBinding = oTable.getBinding("items");

            // Get search value (e.g. from an Input field)
            var sQuery = this.byId("searchId").getValue();

            // Create filter
            var aFilters = [];
            if (sQuery) {
                aFilters.push(new sap.ui.model.Filter("EmpId", sap.ui.model.FilterOperator.EQ, sQuery));
            }

            // Apply filter
            oBinding.filter(aFilters, "Application");
        },

        onErrorMessageDialogPress: function(oEvent) {
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext();
            var oEmployeeName= oContext.getProperty('FullName');
            var oEmployeeId = oContext.getProperty('EmpId');
            var sPath = "/EMPLOYEESSet(EmpId='" + oEmployeeId + "')"; // Key-based path
            var oModel = this.getView().getModel(); // OData Model from manifest

			if (!this.oErrorMessageDialog) {
				this.oErrorMessageDialog = new Dialog({
					type: DialogType.Message,
					title: "Error",
					state: ValueState.Error,
					content: new Text({ text: `Are you sure you want to delete this employee? ${oEmployeeName}` }),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "OK",
						press: function () {
                             // Call OData delete here
                            oModel.remove(sPath, {
                                success: function () {
                                    sap.m.MessageToast.show("Employee deleted successfully");
                                },
                                error: function () {
                                    const response = JSON.parse(oError.responseText);//Convert JSON to Object to catch error
                                    const errorMessage = response.error.message.value;//Catched Error 
                                    sap.m.MessageBox.error(errorMessage);
                                }
                            });
							this.oErrorMessageDialog.close();
                            oView.getModel().refresh(true);
						}.bind(this)
					}),
                    endButton: new Button({    
                    text: "Cancel",
                    press: function () {
                            this.oErrorMessageDialog.close();
                            this.oErrorMessageDialog.destroy();
                            this.oErrorMessageDialog = null;
                        }.bind(this)
                    }),
				});
			}

			this.oErrorMessageDialog.open();
        },

        /**
         * Sort Ascending
         */
        onSortAscending: function (oEvent) {
            var oTable = this.byId("employeeTable");
            var oBinding = oTable.getBinding("items");

            // إنشاء Sorter بالاتجاه التنازلي (Descending)
            var oSorter = new sap.ui.model.Sorter("EmpId", true); // true = descending

            console.dir(oSorter);
            // تطبيق الـSorter
            oBinding.sort(oSorter);
        },

        /**
         *Expanded Panel 
         */
		onOverflowToolbarPress : function () {
			var oPanel = this.byId("expandablePanel");
			oPanel.setExpanded(!oPanel.getExpanded());
		},

        /**
         * open Dialog ()
         */
        onOpenFilterDialog: function () {
            this.byId("filterDialog").open();
        },

        onCancelDialog: function () {
            this.byId("filterDialog").close();
        },

         onConfirmFilter: function () {

        },

        /**
         * Clear all filter and loaded all data  
         */
        onClearFilters: function () {
            this.byId("filterDialog").close();
            this._loadedModel();
        },
        
        _updateEmployeesCount: function () {
            // let cEmployees = this.getOwnerComponent().getModel().getProperty('employees') || [];
            // console.log(Count of Employee: ${cEmployees.length});
        },


        /**
         * Select operator like (EQ, NE, GT, LT)
         */
        onValueHelpRequest: function (oEvent) {
            var that = this;
            var oInput = oEvent.getSource();

            if (!this._oValueHelpDialog) {
                this._oValueHelpDialog = new sap.m.SelectDialog({
                    title: "Select Operator",
                    items: [
                            new sap.m.StandardListItem({ title: "EQ", type: "Active", description: "= Equal" }),
                            new sap.m.StandardListItem({ title: "NE", type: "Active", description: "≠ Not Equal" }),
                            new sap.m.StandardListItem({ title: "GT", type: "Active", description: "> Greater Than" }),
                            new sap.m.StandardListItem({ title: "LT", type: "Active", description: "< Less Than" }),
                            new sap.m.StandardListItem({ title: "GE", type: "Active", description: "≥ Greater or Equal" }),
                            new sap.m.StandardListItem({ title: "LE", type: "Active", description: "≤ Less or Equal" }),
                            new sap.m.StandardListItem({ title: "Contains", type: "Active", description: "Contains" }),
                            new sap.m.StandardListItem({ title: "StartsWith", type: "Active", description: "Starts With" }),
                            new sap.m.StandardListItem({ title: "EndsWith", type: "Active", description: "Ends With" })
                    ],
                    confirm: function (oConfirmEvent) {
                        var oSelected = oConfirmEvent.getParameter("selectedItem");
                        if (oSelected) {
                            // GET Title
                            oInput.setValue(oSelected.getTitle());
                            // APPLY FILTER TO TABLE
                            var oTable = that.byId("employeeTable");
                            var oBinding = oTable.getBinding("items");
                            var empId = that.byId("empId");
                            var salary = that.byId("salaryId");
                            // Create filter
                            var aFilters = [];
                            if (sQuery) {
                                aFilters.push(new sap.ui.model.Filter("EmpId", sap.ui.model.FilterOperator.oSelected.getTitle(), sQuery));
                            }

                            // Apply filter
                            // oBinding.filter(aFilters, "Application");
                        }
                    }
                });
            }

            this._oValueHelpDialog.open();
        },

        onExportExcel: function () {
            try {
                var oTable = this.byId("employeeTable");  // اسم الجدول في الـ XML
                var oBinding = oTable.getBinding("items");
                var aContexts = oBinding.getCurrentContexts();  // يحترم الفلاتر والسورت الحالية
                var aData = aContexts.map(function (oCtx) {
                return oCtx.getObject();
                });

                if (!aData.length) {
                sap.m.MessageToast.show("لا توجد بيانات للتصدير");
                return;
                }

                // تعريف الأعمدة بناءً على EMPLOYEESSet
                var aColumns = [
                { label: "Employee ID", property: "EmpId", type: "string" },
                { label: "First Name", property: "FirstName", type: "string" },
                { label: "Last Name", property: "LastName", type: "string" },
                { label: "Full Name", property: "FullName", type: "string" },
                { label: "Gender", property: "Gender", type: "string" },
                { label: "Date of Birth", property: "Dob", type: "date" },
                { label: "Position", property: "Positions", type: "string" },
                { label: "Join Date", property: "JoinDate", type: "date" },
                { label: "Salary", property: "Salary", type: "number", scale: 2 },
                { label: "National ID", property: "NationalId", type: "string" },
                { label: "Email", property: "Email", type: "string" },
                { label: "Phone", property: "Phone", type: "string" },
                { label: "Address", property: "Address", type: "string" },
                { label: "Marital Status", property: "MaritalStatus", type: "string" },
                { label: "Status", property: "Status", type: "string" },
                { label: "Created By", property: "CreatedBy", type: "string" },
                { label: "Created On", property: "CreatedOn", type: "date" },
                { label: "Changed By", property: "ChangedBy", type: "string" },
                { label: "Changed On", property: "ChangedOn", type: "date" }
                ];

                // إعداد ملف الإكسل
                var oSettings = {
                workbook: {
                    columns: aColumns,
                    context: {
                    application: 'Fiori Export',
                    title: 'Employees Data Export'
                    }
                },
                dataSource: aData,       // البيانات الجاهزة من الجدول
                fileName: "Employees.xlsx"
                };

                var oSheet = new sap.ui.export.Spreadsheet(oSettings);
                oSheet.build().then(function () {
                sap.m.MessageToast.show("تم تصدير الملف بنجاح");
                }).catch(function (err) {
                sap.m.MessageBox.error("فشل التصدير: " + err);
                }).finally(function () {
                oSheet.destroy();
                });

            } catch (e) {
                sap.m.MessageBox.error("حدث خطأ غير متوقع أثناء التصدير: " + e.message);
            }
    },

    onExportPDF: async function () {
        var that = this;
        sap.ui.require(['employees/util/LibraryLoader'], function (LibraryLoader) {
            LibraryLoader.loadJsPDF().then(function () {
            var oTable = that.byId('employeeTable');
            var oBinding = oTable.getBinding('items');

            if (!oBinding) {
                sap.m.MessageToast.show('No data found to export.');
                return;
            }

            // جلب البيانات الحالية من الجدول (تحترم الفلاتر والسورت)
            var aContexts = oBinding.getContexts(0, oBinding.getLength());
            var aData = aContexts.map(function (oContext) {
                return oContext.getObject();
            });

            if (!aData.length) {
                sap.m.MessageToast.show('No data found to export.');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'landscape' });

            doc.text('Employees List', 14, 15);

            // الأعمدة اللي هتظهر في PDF
            const aColumns = [
                'EmpId',
                'FullName',
                'Gender',
                'Dob',
                'Positions',
                'JoinDate',
                'Salary',
                'NationalId',
                'Email',
                'Phone',
                'Address',
                'MaritalStatus',
                'Status'
            ];

            // تجهيز البيانات للجدول
            const aBody = aData.map(emp => [
                emp.EmpId || '',
                emp.FullName || '',
                emp.Gender || '',
                emp.Dob ? new Date(emp.Dob).toLocaleDateString() : '',
                emp.Positions || '',
                emp.JoinDate ? new Date(emp.JoinDate).toLocaleDateString() : '',
                emp.Salary || '',
                emp.NationalId || '',
                emp.Email || '',
                emp.Phone || '',
                emp.Address || '',
                emp.MaritalStatus || '',
                emp.Status || ''
            ]);

            // إنشاء جدول PDF
            doc.autoTable({
                head: [aColumns],
                body: aBody,
                startY: 20,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [63, 81, 181] },
                theme: 'grid'
            });

            // حفظ الملف
            doc.save('EmployeesList.pdf');
            });
        });
    }

    });
});
