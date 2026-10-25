    // COLUMN DEFINITIONS
    
    // Define per-column formatting rules
    const columnFormatMap = {
      "Segment": {
        title: `<i class="fa-solid fa-align-left" style="font-size: 1.5em; margin-left: 22px; padding-bottom: 8px;"></i><br>Segment`,
        width: 94,
        hozAlign: "left",
        frozen: true,
        headerVertical: false,
        hozAlign: "center",
        headerHozAlign: "center",
        vertAlign: "middle",
        headerFilter: "input",        
        headerFilterFunc: createBooleanHeaderFilterFunc("Segment"),
        cssClass: "segment",        
        cellClick: function (e, cell) {
          if (cell.getRow().getData()?.__mergeResult) return;
        
          const messageEl = document.getElementById("message-row");
          setMessage("");
          statState = "";
          
          const rowData = cell.getRow().getData();
          let targetLink = String(rowData.Link);    // Expected 1–12 if books, 1-x if scenes
          
          // If format like "1.xxx", convert to "01.xxx"
          console.log("TARGETLINK:", targetLink);          
          if (targetLink.length > 1 && targetLink[1] === ".") {
            targetLink = "0" + targetLink;
          }
          
          console.log("TARGETLINK2:", targetLink);
          
          // Use current menu state from your globals
          const currentBook = selectedBook;
          const currentLength = selectedLength;

          // CASE 1: Aeneid view
          if (currentBook === 0) {

            // Optionally simulate click
            document.querySelector(`.book[data-book="${targetLink}"]`)?.click();
          }

          // CASE 2: Book view (scene-level)
          else if (currentLength === "scene") {
            
            linkFilter = targetLink;
            setFilterOnReload = true;
            document.querySelector(`.passage[data-book="${currentBook}"]`)?.click();
          }

          // CASE 3: Already in segment view (toggle or refine)
          else if (currentLength === "segment") {
          
            if (focusedSegment !== null) {
              table.removeFilter("Segment", "=", focusedSegment);
              focusFilterFn  = null;
              focusedSegment = null;
              return;
            }
          
            const currentSceneValue = table.getHeaderFilters().find(f => f.field === "Scene");
            const currentSectionValue = table.getHeaderFilters().find(f => f.field === "Section");
            
            const firstRow = (table.getRows("active") || [])[0];
            const segToScroll = firstRow ? firstRow.getData().Segment : null;
            
            if (currentSceneValue && currentSceneValue.value !== "" && currentSceneValue.value != null) {
              // ✅ Filter is set → execute A
              const currentSceneFilter = stripISuffix(currentSceneValue.value);
              
              const onRender = () => {
                if (segToScroll) {
                  const rc = (table.searchRows("Segment", "=", segToScroll) || [])[0];
                  if (rc) table.scrollToRow(rc, "top", true);
                }
                table.off("renderComplete", onRender);
              };
              table.on("renderComplete", onRender);              

              if (currentSectionValue && currentSectionValue.value !== "" && currentSectionValue.value != null) {
                table.setHeaderFilterValue("Section", "");
              } else {
                table.setHeaderFilterValue("Scene", "");
              }
            } else {
              // 🚫 Filter is NOT set → execute B
              const sceneValue = stripISuffix(rowData.Scene);

              // ====> B block here
              table.setHeaderFilterValue("Scene", sceneValue);
              table.setHeaderFilterValue("Section", "");
            }
          }

          // CASE 4: Different book — jump to segment view of another book
          else {

            document.querySelector(`.passage[data-book="${targetBook}"]`)?.click();
          }
        }
      },
      "Plot": {
        title: `<i class="fa-solid fa-person-walking" style="font-size: 1.5em; padding-bottom: 12px;"></i><br>Plot summary`,
        width: 130,
        hozAlign: "left",
        headerHozAlign: "center",
        resizable: true,
        headerVertical: false,
        headerSort: false,
        headerFilter: "input",
        headerFilterFunc: createBooleanHeaderFilterFunc("Plot"),
        frozen: true,        
        cssClass: "plot wrap-text plot-border-right plot-border-left",
        cellMouseEnter: function (e, cell) {
          if (cell.getRow().getData()?.__mergeResult) return;
          mouseOnCell = true;
          if (!usePlotTooltip) return;
          const data = cell.getRow().getData();
          let textFile;
          let textAnchor;
          if ( selectedBook == 0 ) {
            const bookToShow = data.Link;
            textFile = "texts/aeneis" + bookToShow + ".html";
          } else if (selectedBook == 13) {
            const seg = String(data.Segment ?? "").trim();
            const firstTwo = seg.slice(0, 2);                 // e.g. "01", "10"
            const bookFromSegment = firstTwo.replace(/^0(?=\d)/, ""); // "01"→"1", "10"→"10"
            textFile = "texts/aeneis" + bookFromSegment + ".html";
            textAnchor = "section" + data.Section;
          } else {
            textFile = "texts/aeneis" + selectedBook + ".html";
            textAnchor = "section" + data.Section;
          }
          showTimeout = setTimeout(() => {
            if (mouseOnCell) {
              showHoverPanel(e.clientX, e.clientY, textFile, textAnchor);
            }
          }, 800);
        },
        cellMouseLeave: function () {
          mouseOnCell = false;
          if (!usePlotTooltip) return;
          clearTimeout(showTimeout);
          hoverActive = mouseOnPanel; // keep visible if mouse is on panel
          setTimeout(tryHideHoverPanel, 150); // small delay to avoid flicker
        },
        cellClick: function (e, cell) {
          if (cell.getRow().getData()?.__mergeResult) {
            toggleFocusRow(cell.getRow());
            return;
          }
          if (!usePlotFilter) return;
          
          const messageEl = document.getElementById("message-row");
          setMessage("");
          statState = "";
                   
          if (isRowSorted) {
            restoreOriginalColumnOrder();  // ✅ first: restore columns while filter is still applied
            isRowSorted = false;
            if ( selectedBook != 0 ) {
              scopeGlobalRadio.disabled = false;
              scopeLocalRadio.disabled = false;
            }
            basisSelfRadio.disabled = false;
            basisTypRadio.disabled = false;
            basisPeriodRadio.disabled = false;
            coltohide = "copy_"+currentTrendSortValue;
            table.getColumn(coltohide).hide();
          }  
          
          toggleFocusRow(cell.getRow());
          return;         
          
          const rowData = cell.getRow().getData();
          const targetLink = rowData.Link;    // Expected 1–12 if books, 1-x if scenes

          // Use current menu state from your globals
          const currentBook = selectedBook;
          const currentLength = selectedLength;

          // CASE 2: Book view (scene-level)
          if (currentBook === 0 || currentLength === "scene") {
            
            const currentSectionValue = table.getHeaderFilters().find(f => f.field === "Link");

            if (currentSectionValue && currentSectionValue.value !== "" && currentSectionValue.value != null) {
              // ✅ Filter is set → execute A
              const currentSectionFilter = currentSectionValue.value;

              // ====> A block here
              table.setHeaderFilterValue("Link", "");
            } else {
              // 🚫 Filter is NOT set → execute B
              const sectionValue = rowData.Link;

              // ====> B block here
              table.setHeaderFilterValue("Link", sectionValue);
            }
          }

          // CASE 3: Already in segment view (toggle or refine)
          else if (currentLength === "segment") {
            const currentSectionValue = table.getHeaderFilters().find(f => f.field === "Section");

            if (currentSectionValue && currentSectionValue.value !== "" && currentSectionValue.value != null) {
              // ✅ Filter is set → execute A
              const currentSectionFilter = currentSectionValue.value;

              // ====> A block here
              table.setHeaderFilterValue("Section", "");
            } else {
              // 🚫 Filter is NOT set → execute B
              const sectionValue = rowData.Section;

              // ====> B block here
              table.setHeaderFilterValue("Section", sectionValue);
            }
          }

          // CASE 4: Different book — jump to segment view of another book
          else {
            document.querySelector(`.passage[data-book="${targetBook}"]`)?.click();
          }
        }
        
      },      
      "Scene": {
        title: "Scene",
        width: 40,
        hozAlign: "center",

        // keep the list UI if you like; programmatic filtering still works
        headerFilter: "list",

        // ✅ force strict string comparison
        headerFilterFunc: function (headerValue, rowValue, rowData) {
          if (rowData?.__mergeResult) return true;
          if (headerValue == null || headerValue === "") return true;
          return String(rowValue) === String(headerValue);
        },

        // (optional) ensure the stored value is a string (prevents numeric coercion)
        mutator: function (value) {
          return value == null ? value : String(value);
        },

        headerFilterParams: {
          values: (() => {
            // leave as-is if you want the simple 1..16 dropdown;
            // programmatic values like "03.10" will still filter correctly
            const obj = {"": ""};
            for (let i = 1; i <= 16; i++) obj[i.toString()] = i.toString();
            return obj;
          })()
        },

        visible: false,
      },      
      
      "Section": {
        title: "Section",
        width: 40,
        hozAlign: "center",
        headerFilter: "list",        
        headerFilterFunc: function (headerValue, rowValue, rowData) {
          if (rowData?.__mergeResult) return true;
          if (headerValue == null || headerValue === "") return true;
          return String(rowValue) === String(headerValue);
        },
        headerFilterParams: {
          values: (() => {
            let obj = {"": ""};
            for (let i = 1; i <= 100; i++) obj[i] = i.toString();
            return obj;
          })()
        },

        visible: false,
      },                  
      "Link": {
        title: "Link",
        width: 40,
        hozAlign: "center",
        headerFilter: "list",        
        headerFilterFunc: function (headerValue, rowValue, rowData) {
          if (rowData?.__mergeResult) return true;
          if (headerValue == null || headerValue === "") return true;
          return String(rowValue) === String(headerValue);
        },
        headerFilterParams: {
          values: (() => {
            let obj = {"": ""};
            for (let i = 1; i <= 16; i++) obj[i] = i.toString();
            return obj;
          })()
        },

        visible: false,
      },                        
      "Tags": {
        title: "Tags",
        width: 80,
        hozAlign: "left",
        visible: false,
      },
      "Ser": {
        title: "Servius",
        hozAlign: "center",
        cssClass: "header-period1",
      },
      "^Co^": {
        title: "ΔServius",
        hozAlign: "center",
        headerVertical: "flip",
        headerHozAlign: "left",
        cssClass: "header-period1 thin-padding header-thin-padding",        
      },
      "DS": {
        title: "Servius Auctus",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period1",        
      },
      "TCD": {
        title: "T. C. Donatus",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period1",        
      },      
      "^sV^": {
        title: "sch. Veron.",
        hozAlign: "center",
        formatter: function(cell) {
          const value = cell.getValue();
          return value === 100 ? "+" : "";
        },
        cssClass: "border-bottom narrow sV header-period1 header-thin-padding thin-padding",
      },
      "^Fulg^": {
        title: 'Fulgentius',
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period1 thin-padding-left header-thin-padding",                
      },            
      "^BS^": {
        title: '"Bernardus Silv."',
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2 thin-padding-right header-thin-padding",                
      },      
      "BS": {
        title: '"Bernardus Silv."',
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2",                        
      },            
      "^AnsBNL^": {
        title: '"Anselm" (BNL)',
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2 narrow thin-padding-left header-thin-padding",                        
      },                  
      "^AnsPr^": {
        title: '"Anselm" (Pr)',
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2 narrow thin-padding-right header-thin-padding",                        
      },                        
      "GdV": {
        title: "Giovanni del V.",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2",                                
      },
      "Zon": {
        title: "Zono de Magnalis",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2",                                
      },      
      "^Bero^": {
        title: 'Beroaldo',
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "border-bottom sV narrow header-period2 header-thin-padding thin-padding",        
      },                        
      "Pom": {
        title: "Pomponio Leto",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2",                                
      },            
      "Leo": {
        title: "Pietro Leoni",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2",                                
      },      
      "^Leo^": {
        title: "Pietro Leoni",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2 thin-padding header-thin-padding",                                
      },            
      "Lan": {
        title: "Landino",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2",                                
      },
      "^TCDLand1^": {
        title: "Don. excerpted (rate)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2 narrow thin-padding-left header-thin-padding",                                
      },           
      "^TCDLand2^": {
        title: "Don. excerpted",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2 narrow thin-padding-right header-thin-padding",                                
      },                 
      "Bad": {
        title: "Badius",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2",                                
      },
      "Cam": {
        title: "Camynade",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2",                                
      },      
      "^Cam^": {
        title: "Camynade",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2 thin-padding header-thin-padding",                                
      },            
      "^Bra^": {
        title: "Brant",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2 thin-padding header-thin-padding",                                
      },
      "^Bra2^": {
        title: "Brant",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "sV narrow border-bottom header-period2 thin-padding header-thin-padding",                                
      },                  
      "^Sul^": {
        title: "Sulpizio",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2 thin-padding header-thin-padding",                                
      },      
      "Sul": {
        title: "Sulpizio",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2",                                
      },            
      "Prs": {
        title: "Parrasio",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2",                                
      },                  
      "Sct": {
        title: "Schott",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2",                                
      },      
      "^Val^": {
        title: "Pierio Valeriano",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period2 thin-padding header-thin-padding",                                
      },      
      "Mel": {
        title: "Melanchthon",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                
      },      
      "^Mel^": {
        title: "Melanchthon",
        cssClass: "header-period3 thin-padding header-thin-padding",                                        
      },      
      "^Era^": {
        title: "Erasmus",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "erasmus header-period3 thin-padding header-thin-padding",                                
      },
      "^Era2^": {
        title: "Erasmus",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "erasmus border-bottom sV narrow header-period3 thin-padding header-thin-padding",                                
      },                  
      "Ery": {
        title: "Erythraeus",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                        
      },      
      "Nan": {
        title: "Nannius",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                        
      },            
      "Be": {
        title: "Fabricius-Bech",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                        
      },      
      "Bch": {
        title: "Fabricius-Bech",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                        
      },      
      "Rob": {
        title: "Robortello",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                        
      },             
      "^Hrt^": {
        title: "Hartung",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3 thin-padding header-thin-padding",                                        
      },                  
      "Cor": {
        title: "Corrado",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                        
      },            
      "Man": {
        title: "Paolo Manuzio",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                        
      },      
      "^Man^": {
        title: "Paolo Manuzio",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3 thin-padding header-thin-padding",                                        
      },            
      "^Ho1^": {
        title: "Hortensius (1-6)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3 narrow thin-padding-left header-thin-padding",
      },      
      "^Ho2^": {
        title: "Hortensius (7-12)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3 narrow thin-padding-right header-thin-padding",
      },      
      "Ho1": {
        title: "Hortensius (1-6)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                        
      },      
      "Ho2": {
        title: "Hortensius (7-12)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                        
      },
      "^Sca^": {
        title: "Scaliger",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3 thin-padding header-thin-padding",
      },            
      "Reg": {
        title: "Regoli",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                        
      },            
      "^Ors^": {
        title: "Orsini",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3 thin-padding-left header-thin-padding",                                        
      },      
      "^Gue^": {
        title: "de Guélis",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3 thin-padding-right header-thin-padding",                                        
      },            
      "Est": {
        title: "Estienne",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                        
      },      
      "Mey": {
        title: "Meyen",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                        
      },      
      "^Nas^": {
        title: "Nascimbeni",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3 thin-padding header-thin-padding",                                        
      },      
      "Nas": {
        title: "Nascimbeni",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                        
      },            
      "Bers": {
        title: "Bersmann",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                        
      },      
      "Fab": {
        title: "Fabrini",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                        
      },            
      "Ven": {
        title: "Venuti",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                        
      },
      "Sgl": {
        title: "Strigel",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3",                                        
      },
      "^Sgl^": {
        title: "Strigel",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period3 thin-padding header-thin-padding",                                        
      },                              
      "Pon": {
        title: "Pontanus",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period4",        
      },      
      "Cer": {
        title: "La Cerda",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period4",        
      },      
      "Tau": {
        title: "Taubmann",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period4",        
      },      
      "Ben": {
        title: "Beni",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period4",        
      },            
      "Abr": {
        title: "Abram",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period4",        
      },      
      "Far": {
        title: "Farnaby",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period4",        
      },
      "Min": {
        title: "Minell",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period4",        
      },            
      "Sch": {
        title: "Schrevel",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period4",        
      },      
      "Mat": {
        title: "de Matienzo",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period4",        
      },            
      "Rue": {
        title: "De la Rue",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period4",        
      },      
      "Jck": {
        title: "Juncker",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period4",        
      },      
      "Kgl": {
        title: "Kriegel",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period4",        
      },            
      "Coo": {
        title: "Cooke",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period4",        
      },      
      "^Coo^": {
        title: "Cooke",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period4 thin-padding header-thin-padding",        
      },            
      "HB": {
        title: "Heinsius-Burman",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period4",        
      },      
      "^Hex^": {
        title: "Heyne (excursus)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "border-bottom narrow sV header-period5 header-thin-padding thin-padding"
      },            
      "^H1^": {
        title: "Heyne (1st ed.)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period5 thin-padding-left header-thin-padding",        
      },      
      "^H2^": {
        title: "Heyne (2nd ed.)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period5 thin-padding-right header-thin-padding",        
      },            
      "H3": {
        title: "Heyne (3rd ed.)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period5",        
      },      
      "HW": {
        title: "Heyne-Wagner",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period5",        
      },      
      "For": {
        title: "Forbiger",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period5",          
      },
      "Pkp": {
        title: "Peerlkamp",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period5",          
      },                        
      "Con": {
        title: "Conington",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period5",        
      },      
      "^Con^": {
        title: "Conington",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period5 thin-padding header-thin-padding",        
      },            
      "CN": {
        title: "Conington-Nettleship",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period5",        
      },      
      "Kap": {
        title: "Kappes",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period5",          
      },            
      "^Hen^": {
        title: "Henry",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period5 thin-padding header-thin-padding",        
      },            
      "Wnr": {
        title: "Weidner",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period5",        
      },            
      "Lwg": {
        title: "Ladewig",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period5",        
      },      
      "Sab": {
        title: "Sabbadini",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period5",        
      },      
      "Pag": {
        title: "Page",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },      
      "Pge": {
        title: "Page",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },          
      "WF": {
        title: "Warde Fowler",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },                
      "^N1^": {
        title: "Norden (1st ed.)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6 thin-padding header-thin-padding",        
      },            
      "^N2^": {
        title: "Norden (2nd ed.)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6 thin-padding header-thin-padding",        
      },            
      "N3": {
        title: "Norden (3rd ed.)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },                  
      "Mac": {
        title: "Mackail",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },      
      "Mck": {
        title: "Mackail",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },  
      "Fle": {
        title: "Fletcher",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "Bus": {
        title: "Buscaroli",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "Pea": {
        title: "Pease",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "Spe": {
        title: "Speranza",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "Cwy": {
        title: "Conway",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },      
      "Wil": {
        title: "Williams",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "W12": {
        title: "Williams (12 books)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },      
      "Edn": {
        title: "Eden",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "Gra": {
        title: "Gransden",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "Frd": {
        title: "Fordyce",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "Aus": {
        title: "Austin",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "Per": {
        title: "Perret",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },      
      "^Per^": {
        title: "Perret",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6 thin-padding header-thin-padding",        
      },            
      "Par": {
        title: "Paratore",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },      
      "Din": {
        title: "Dingel",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },              
      "Hrd": {
        title: "Hardie",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },                  
      "Frl": {
        title: "Farrell",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "FS": {
        title: "Fratantuono et al.",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "OHr": {
        title: "O'Hara",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "Gan": {
        title: "Ganiban",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "Hrf": {
        title: "Horsfall",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "Fra": {
        title: "Fratantuono",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "McG": {
        title: "McGill",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },                  
      "Hrs": {
        title: "Harrison",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },                  
      "Jtn": {
        title: "Johnston",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "HM": {
        title: "Heyworth-Morwood",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },                  
      "Cas": {
        title: "Casali",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "Ros": {
        title: "Rossi",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "Tar": {
        title: "Tarrant",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "Bin": {
        title: "Binder",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },
      "Gar": {
        title: "García et al.",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },            
      "Pkl": {
        title: "Perkell",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "header-period6",        
      },
      // Miscellanea: sparse, presence-only commentaries
      "^MiscDC^": {
        title: "Dalla Croce",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "border-bottom sV narrow header-period2 header-thin-padding thin-padding",
      },
      "^MiscBon^": {
        title: "M. Bonfini",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "border-bottom sV narrow header-period2 header-thin-padding thin-padding",
      },
      "^MiscCos^": {
        title: "Costanzi",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "border-bottom sV narrow header-period2 header-thin-padding thin-padding",
      },
      "^MiscRho^": {
        title: "Rhodiginus",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "border-bottom sV narrow header-period2 header-thin-padding thin-padding",
      },
      "^MiscDel^": {
        title: "Delfini",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "border-bottom sV narrow header-period2 header-thin-padding thin-padding",
      },
      "^MiscScoe^": {
        title: "Scoelsius",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "border-bottom sV narrow header-period2 header-thin-padding thin-padding",
      },
      "^MiscScop^": {
        title: "Scoppa",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "border-bottom sV narrow header-period3 header-thin-padding thin-padding",
      },
      "^MiscMod^": {
        title: "Modicius",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "border-bottom sV narrow header-period3 header-thin-padding thin-padding",
      },
      "^MiscPao^": {
        title: "Paolini",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "border-bottom sV narrow header-period3 header-thin-padding thin-padding",
      },
      "^MiscWill^": {
        title: "Willemer",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "border-bottom sV narrow header-period4 header-thin-padding thin-padding",
      },
      "copy_TYP": {
        title: "TRENDS (All)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "trends typ",        
        sorter: "number"        
      },
      "copy_CO1": {
        title: "TRENDS (Per. 1)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "trends header-period1",        
      },
      "copy_CO2": {
        title: "TRENDS (Per. 2)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "trends header-period2",        
      },                              
      "copy_CO3": {
        title: "TRENDS (Per. 3)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "trends header-period3",        
      },                              
      "copy_CO4": {
        title: "TRENDS (Per. 4)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "trends header-period4",        
      },                              
      "copy_CO5": {
        title: "TRENDS (Per. 5)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "trends header-period5",        
      },                              
      "copy_CO6": {
        title: "TRENDS (Per. 6)",
        hozAlign: "center",
        headerVertical: "flip",
        cssClass: "trends header-period6",        
      },                                    
    };
