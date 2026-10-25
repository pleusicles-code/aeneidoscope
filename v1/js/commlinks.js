// Commentary links from data/commlinks.csv.
// Shared state (commLinkData, selectedBook, selectedLength, current_cell_link) is provided by app.js.

    function constructCommLink(field, segment) {
      
      local_pdf_dir = "http://localhost:8000/"
    
      segment = segment.replace(/\*/g, "");
      field = field.replace(/\^/g, "");
      
      //segment is a book
      if (segment.startsWith("Aen. ")) {
        segment = segment.slice(5).trim() + ".001";
      } else if (segment.includes("-")) {
      // segment is a scene
        segment = segment.split("-")[0].trim();
      }
    
      const row = commLinkData.find(entry => entry.Segment === segment);
      if (!row) {
        console.warn("No row found for segment:", segment);
        return null;
      }

      if (field === "Pag") {
        field = "Pge"
      }
      
      let linkValue = "";
      linkValue = row[field];
      
      //it the previous code did not work, also try field with carets
      if (!linkValue) {
        field2 = "^" + field + "^";
        linkValue = row[field2]
      }
      
      // COMMLINKS
      // **** marks book and scene links, *** book-only links, ** scene-only links.
      // Scholia Veronensia (sV) is exempt: its current repository links only to book beginnings.
      if (field !== "sV" && typeof linkValue === "string") {
        if (linkValue.startsWith("****")) {
          if (selectedBook !== 0 && selectedLength !== "scene") return "";
          linkValue = linkValue.slice(4);
        } else if (linkValue.startsWith("***")) {
          if (selectedBook !== 0) return "";
          linkValue = linkValue.slice(3);
        } else if (linkValue.startsWith("**")) {
          if (selectedLength !== "scene") return "";
          linkValue = linkValue.slice(2);
        }
      }
      
      let constructedLink = "";
      
      if (["Ser", "DS", "^Co^", "Co"].includes(field)) {
        constructedLink = "https://latin.packhum.org/cit/Serv/A/" + linkValue
      }

      else if (["TCD"].includes(field)) {
        if (linkValue.includes("1#")) {
          baseUrl = "https://archive.org/details/interpretationes01donauoft/page/"
        } else {
          baseUrl = "https://archive.org/details/interpretationes02donauoft/page/"
        }
        linkValue = Math.floor(parseFloat(linkValue.slice(2)));
        constructedLink = baseUrl + linkValue + "/mode/1up";
      }                  

      else if (["sV"].includes(field)) {
        // Only book-beginning anchors are available; ignore the older passage URLs in the CSV.
        console.log(segment);
        constructedLink = "https://www.digiliblt.uniupo.it/teidocs/idno/DLT000466/build/html#";
        
        if (segment.startsWith("01")) {
          constructedLink += "CIDOOGMPY73ZNYKKQJ6";
        } else if (segment.startsWith("02")) {
          constructedLink += "CIDJ2YUANYVCQDW7YBD";
        } else if (segment.startsWith("03")) {
          constructedLink += "CIDKQHOZ4KVOVOPXGQ";
        } else if (segment.startsWith("04")) {
          constructedLink += "CIDBKIGQWXRKTOKHGG";
        } else if (segment.startsWith("05")) {
          constructedLink += "CIDHNYTTQB4PYF5X1F6";          
        } else if (segment.startsWith("07")) {
          constructedLink += "CID0VZDER3ZV4EB0XJM";
        } else if (segment.startsWith("08")) {
          constructedLink += "CIDRDJTOXKMQHAHKXA";
        } else if (segment.startsWith("09")) {
          constructedLink += "CIDSROTHCXO2XNPOK2U";
        } else if (segment.startsWith("10")) {
          constructedLink += "CIDTFKHQXLUZEG6A31";
        } else if (segment.startsWith("12")) {
          constructedLink += "CIDLGKLT1Q0ZDXNAL";
        }
      }      

      else if (["Bero"].includes(field)) {
        if (linkValue !== "") {
          constructedLink = "https://gallica.bnf.fr/view3if/ga/ark:/12148/bpt6k10903547/f" + linkValue;
        }
      }

      else if (["BS"].includes(field)) {
        constructedLink = "https://archive.org/details/commentumquoddic0000unse/page/" + linkValue + "/mode/1up"
      }      
      
      else if (["AnsPr"].includes(field)) {
        constructedLink = "wrappers/mirador-wrapper-anselm_pr.html?page=" + linkValue
      }      

      else if (["AnsBNL"].includes(field)) {
        constructedLink = "https://gallica.bnf.fr/view3if/ga/ark:/12148/btv1b10032565w/f" + linkValue
      }            
      
      else if (["Zon"].includes(field)) {
        if (linkValue.startsWith("Vind")) {
          linkValue = linkValue.slice(4);
          constructedLink = "https://viewer.onb.ac.at/1320AE61/" + linkValue
        } else {
          constructedLink = "wrappers/mirador-wrapper-zono.html?page=" + linkValue
        }
      }
      
      else if (["Pom"].includes(field)) {
        linkValue = Math.floor(parseFloat(linkValue) + 26);
        constructedLink = "https://www.digitale-sammlungen.de/en/view/bsb10995569?page=" + linkValue
      }
    
      else if (["Leo", "^Leo^"].includes(field)) {
        linkValue = Math.floor(parseFloat(linkValue));
        constructedLink = "https://www.google.com/books/edition/Cynthii_Cenetensis_in_Virgilii_Aeneidem/oik_AAAAcAAJ?hl=en&gbpv=1&pg=PA" + linkValue
      }

      else if (["Lan", "TCDLand1", "TCDLand2"].includes(field)) {
        linkValue = parseFloat(linkValue);
        constructedLink = "http://diglib.hab.de/show_image.php?dir=inkunabeln/19-4-poet-2f&image=00" + linkValue
      }            

      else if (["Bra2"].includes(field)) {
        linkValue = linkValue
          .replace(/#/g, '/image#col_info"><strong>#')       // "#" → /image"><strong>#
          .replace(/\*/, '</strong></td><td style="padding-top: 12px;">')     // "*" → </strong></td><td> (1st instance)
          .replace(/\*/g, '</strong></td><td>')     // "*" → </strong></td><td> (2nd instance and onwards)
          .replace(/%/g, '</a></td></tr><tr><td><a target="_blank" rel="noopener noreferrer" href="https://digi.ub.uni-heidelberg.de/diglit/vergil1502/0')
          .replace(/\~/g, '#');     // 
        constructedLink = linkValue
      }                  

      else if (field.startsWith("Misc")) {
        if (["MiscDC", "MiscBon", "MiscDel", "MiscPao", "MiscWill"].includes(field)) {
          constructedLink = linkValue;
        } else if (["MiscScop", "MiscRho", "MiscCos"].includes(field)) {            
          constructedLink = "https://www.digitale-sammlungen.de/en/view/bsb10140383?page=" + linkValue
        } else if (["MiscScoe"].includes(field)) {
          constructedLink = "https://www.digitale-sammlungen.de/en/view/bsb10192348?page=" + linkValue
        } else if (["MiscMod"].includes(field)) {
          constructedLink = "https://digitale-sammlungen.de/en/view/bsb10171386?page=" + (Number(linkValue) * 2 + 22);
        }            
      }            
          
      else if (["Bad"].includes(field)) {
        linkValue = parseFloat(linkValue);
        constructedLink = "https://www.digitale-sammlungen.de/en/view/bsb10195834?page=" + linkValue
      }            

      else if (["Cam", "^Cam^"].includes(field)) {
        linkValue = Math.floor(parseFloat(linkValue));
        constructedLink = "https://www.google.com/books/edition/Opera/Xmg6AAAAcAAJ?hl=en&gbpv=1&pg=PP" + linkValue                           
      }    
      
      else if (["Sul"].includes(field)) {
        linkValue = parseFloat(linkValue) + 119;
        constructedLink = "https://www.digitale-sammlungen.de/en/view/bsb10140379?page=" + linkValue
      }                  
      
      else if (["Sct"].includes(field)) {
        constructedLink = "https://www.digitale-sammlungen.de/en/view/bsb10981435?page=" + linkValue
      }
      
      // else if (["Era2"].includes(field)) {
      //   constructedLink = "https://www.digitale-sammlungen.de/en/view/bsb10981435?page=" + linkValue
      // }
          
      else if (["Era"].includes(field) || ["Era2"].includes(field)) {

        // --- normalize input defensively
        const raw = (linkValue === null || linkValue === undefined)
          ? ""
          : String(linkValue).trim();

        if (!raw) {
          linkValue = "";
          return;
        }

        const urls = raw.includes("*")
          ? raw.split("*").map(s => s.trim()).filter(s => s !== "")
          : [raw];

        const escapeHtml = (s) =>
          String(s).replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;",
            '"': "&quot;", "'": "&#39;"
          }[c]));

        // --- numeric key for sorting (Praef. = 0)
        const eraKeyFromUrl = (url) => {
          const m = url.match(/#ra(\d+)/i);
          if (!m) return Number.MAX_SAFE_INTEGER;
          return m[1] === "0000" ? 0 : parseInt(m[1], 10);
        };

        const eraLabelFromUrl = (url) => {
          const m = url.match(/#ra(\d+)/i);
          if (!m) return "Era";
          if (m[1] === "0000") return "Praef.";
          return `#${parseInt(m[1], 10)}`;
        };

        const makeLink = (url) =>
          `<a href="${escapeHtml(url)}"
              target="_blank"
              rel="noopener noreferrer">${escapeHtml(eraLabelFromUrl(url))}</a>`;

        // --- sort numerically: 99 < 100, Praef. first
        const sorted = urls
          .map(url => ({ url, key: eraKeyFromUrl(url) }))
          .sort((a, b) => a.key - b.key)
          .map(o => o.url);
          
        // --- render
        if (sorted.length === 1) {
          constructedLink =
            `<table style="width:100%; border-collapse:collapse; border:none; border-top:0px black solid; table-layout:fixed; margin-top: 10px;"><tr><td style="padding-top: 5px;"><div style="text-align:center;">${makeLink(sorted[0])}</div></td></tr></table>`;
          return constructedLink;
        }

        let html =
          `<table style="width:100%; border-collapse:collapse; border:none; border-top:0px black solid; table-layout:fixed; margin-top: 10px;">
            <colgroup>
              <col style="width:50%">
              <col style="width:50%">
            </colgroup>`;

        for (let i = 0; i < sorted.length; i += 2) {
          html +=
            `<tr>
              <td style="border:none; padding:0; padding-top: 5px; text-align:center;">
                ${makeLink(sorted[i])}
              </td>
              <td style="border:none; padding:0; padding-top: 5px; text-align:center;">
                ${sorted[i + 1] ? makeLink(sorted[i + 1]) : ""}
              </td>
            </tr>`;
        }

        html += `</table>`;
        constructedLink = html;
      }    

      else if (["Ery"].includes(field)) {
        linkValue = parseFloat(linkValue) + 78;
        constructedLink = "https://www.digitale-sammlungen.de/en/view/bsb00016262?page=" + linkValue
      }            

      else if (["Prs"].includes(field)) {
        constructedLink = "https://www.google.com/books?id=uulBAAAAcAAJ&hl=en&gbpv=1&pg=PR" + linkValue
      }            
      
      else if (["Val"].includes(field)) {
        constructedLink = "https://www.google.com/books?id=n4fmEDRi-7QC&hl=en&gbpv=1&pg=PA" + linkValue
      }      

      else if (["Mel"].includes(field)) {
        linkValue = parseFloat(linkValue) + 2;
        constructedLink = "https://digital.staatsbibliothek-berlin.de/werkansicht?PPN=PPN849683238&PHYSID=PHYS_0" + linkValue;
      }
      
      else if (["Rob"].includes(field)) {
        constructedLink = "https://www.google.com/books/edition/Francisci_Robortelli_Vtinensis_De_histor/-T_vHfQKzUAC?hl=en&gbpv=1&pg=PA" + linkValue
      }      

      else if (["Hrt"].includes(field)) {
        constructedLink = "https://www.digitale-sammlungen.de/en/view/bsb10140385?page=" + linkValue
      }            
      
      else if (["Cor"].includes(field)) {
        linkValue = parseFloat(linkValue) + 4;
        constructedLink = "https://babel.hathitrust.org/cgi/pt?id=ucm.532023147x&seq=" + linkValue;
      }                        
      
      else if (["Bch", "Be"].includes(field)) {
        linkValue = parseFloat(linkValue) + 50;
        constructedLink = "https://www.digitale-sammlungen.de/en/view/bsb00017566?page=" + linkValue
      }            

      else if (["Nan"].includes(field)) {
        constructedLink = "https://www.google.com/books/edition/Deuterologiae_sive_spicilegia_in_quartum/wiWkdsHxT94C?hl=en&gbpv=1&pg=PP" + linkValue
      }      
      
      else if (["Man"].includes(field)) {
        if (parseFloat(linkValue) < 353) {
          linkValue = parseFloat(linkValue) + 18;
        } else if (parseFloat(linkValue) < 398) {
          linkValue = parseFloat(linkValue) + 2;
        } else {
          linkValue = parseFloat(linkValue) + 4;
        }
        constructedLink = "https://www.digitale-sammlungen.de/en/view/bsb10171347?page=" + linkValue
      }                  
      
      else if (["Reg"].includes(field)) {
        if (linkValue.includes("1#")) {
          baseUrl = "https://www.google.com/books/edition/Sebastiani_Reguli_Brasichellensis_In_pri/KxwVETZuUhcC?hl=en&gbpv=1&pg=PA"
        } else {
          baseUrl = "https://www.google.com/books/edition/Sebastiani_Reg_Brasichellensis_In_librum/8pn7wlad-14C?hl=en&gbpv=1&pg=PA"
        }
        linkValue = Math.floor(parseFloat(linkValue.slice(2)));
        constructedLink = baseUrl + linkValue
      }          

      else if (["Ho1", "^Ho1^", "Ho2", "^Ho2^"].includes(field)) {
        linkValue = Number(linkValue);      
        constructedLink = "https://www.digitale-sammlungen.de/en/view/bsb10140399?page=" + linkValue
      }                        
      
      else if (["Nas", "^Nas^"].includes(field)) {
        linkValue = Number(linkValue);
        constructedLink = "https://www.digitale-sammlungen.de/en/view/bsb10140399?page=" + linkValue
      }                  

      else if (["Mey"].includes(field)) {
        linkValue = Math.floor(parseFloat(linkValue)) + 34;
        constructedLink = "https://digital.staatsbibliothek-berlin.de/werkansicht?PPN=PPN1024746224&PHYSID=PHYS_0" + linkValue        
      }            
      
      else if (["Est"].includes(field)) {
        constructedLink = "https://www.google.com/books/edition/Publii_Virgilii_Maronis_poemata_Nouis_sc/8N7DMcM2Gf4C?hl=en&gbpv=1&pg=PA" + linkValue
      }            
      
      else if (["Ors"].includes(field)) {
        constructedLink = "https://www.google.com/books?id=Tq1ivH3YdVQC&hl=en&gbpv=1&pg=PA" + linkValue
      }            
      
      else if (["Gue"].includes(field)) {
        linkValue = parseFloat(linkValue) + 16;
        constructedLink = "https://www.digitale-sammlungen.de/en/view/bsb11054187?page=" + linkValue
      }                        
      
      else if (["Bers"].includes(field)) {
        linkValue = parseFloat(linkValue) + 52;
        constructedLink = "wrappers/mirador-wrapper-bersmann.html?page=0" + linkValue;
      }            

      else if (["Fab", "Ven"].includes(field)) {       
        if (typeof linkValue === "string" && linkValue.endsWith(".5")) {
          linkValue = linkValue.replace(/\.5$/, "-IA1");
        } else {
          linkValue = Math.floor(parseFloat(linkValue));
        }        
        constructedLink = "https://www.google.com/books/edition/L_Eneide_di_Virgilio_mantuano_commentata/RMJ76mw4S_oC?hl=en&gbpv=1&pg=PA" + linkValue
      }      

      else if (["Ben"].includes(field)) {
        linkValue = Math.floor(parseFloat(linkValue));
        constructedLink = "https://www.google.com/books/edition/Pauli_Benij_Eugubini_In_P_Virgilij_Maron/i3L3fEM_LrYC?hl=en&gbpv=1&pg=PA" + linkValue
      }

      else if (["Sgl"].includes(field)) {
        linkValue = parseFloat(linkValue) + 20;
        linkValue = String(Math.round(linkValue)).padStart(4, "0");
        //constructedLink = "wrappers/mirador-wrapper-strigel.html?page=" + linkValue;
        constructedLink = "https://digital.staatsbibliothek-berlin.de/werkansicht?PPN=PPN780077105&PHYSID=PHYS_" + linkValue;
      }            
      
      
      else if (["Pon"].includes(field)) {
        linkValue = parseFloat(linkValue);
        constructedLink = "https://www.digitale-sammlungen.de/en/view/bsb10140393?page=" + linkValue
      }                              
      
      else if (["Cer"].includes(field)) {
        if (linkValue.includes("1#")) {
          baseUrl = "wrappers/mirador-wrapper-cerda_vol1.html?page="
          linkValue = String(Math.floor(parseFloat(linkValue.slice(2))) + 2).padStart(4, "0");
        } else {
          baseUrl = "wrappers/mirador-wrapper-cerda_vol2.html?page="
          linkValue = String(Math.floor(parseFloat(linkValue.slice(2))) + 12).padStart(4, "0");
        }       
        constructedLink = baseUrl + linkValue
      }               

      else if (["Tau"].includes(field)) {
        linkValue = String(Math.floor(parseFloat(linkValue)) + 26).padStart(4, "0");
        constructedLink = "https://digital.staatsbibliothek-berlin.de/werkansicht?PPN=PPN820303763&PHYSID=PHYS_" + linkValue        
        
      }                  

      else if (["Abr"].includes(field)) {
        if (linkValue.includes("1#")) {
          baseUrl = "https://www.google.com/books/edition/Nicolai_Abrami_Commentarii_in_Pub_Virgil/XnQZdsHmnYoC?hl=en&gbpv=1&pg=PA"
        } else {
          baseUrl = "https://www.google.com/books/edition/Nicolai_Abrami_e_Societate_Iesu_Commenta/sPBcmUr98g8C?hl=en&gbpv=1&pg=PA"
        }
        linkValue = Math.floor(parseFloat(linkValue.slice(2)));
        constructedLink = baseUrl + linkValue
      }                
      
      else if (["Far"].includes(field)) {
        constructedLink = "https://www.google.com/books?id=lmpeAAAAcAAJ&hl=en&gbpv=1&pg=PA" + linkValue
      }

      else if (["Min"].includes(field)) {
        linkValue = Math.floor(parseFloat(linkValue));
        baseUrl = "https://www.google.com/books/edition/Pub_Virgilii_Maronis_Opera/BqtZAAAAcAAJ?hl=en&gbpv=1&pg=PA"
        constructedLink = baseUrl + linkValue;
      }                 
      
      else if (["Sch"].includes(field)) {
        constructedLink = "https://www.google.com/books/edition/Pub_Virgilii_Maronis_Opera_omnia_cum_not/Vck3JNb4h7UC?hl=en&gbpv=1&pg=PA" + linkValue
        
      }     
      
      else if (["Mat"].includes(field)) {
        linkValue = Math.floor(parseFloat(linkValue));
        baseUrl = "https://www.google.com/books/edition/R_P_Sebastiani_de_Matienzo/SkDQAAAAMAAJ?hl=en&gbpv=1&pg=PA"
        constructedLink = baseUrl + linkValue;
      }      
     
      else if (["Rue"].includes(field)) {
        if (linkValue < 241) {
          linkValue = "PA246-IA" + linkValue
        } else {
          linkValue = "IA" + linkValue
        }
        constructedLink = "https://www.google.com/books?id=lOJoJTeLhKoC&hl=en&gbpv=1&pg=" + linkValue
      }

      else if (["Jck"].includes(field)) {
        constructedLink = "https://www.google.com/books/edition/Publii_Virgilii_Maronis_Eclogae_Georgica/Cb1RAAAAcAAJ?gbpv=1&pg=PA" + linkValue
      }     

      else if (["Kgl"].includes(field)) {
        constructedLink = "https://www.google.com/books/edition/Opera_P_Virgilii_Maronis/mCG3VKEluL4C?gbpv=1&pg=PA" + linkValue
      }     
      
      
      else if (["Coo"].includes(field)) {
        constructedLink = "https://www.google.com/books/edition/Publii_Virgilii_Maronis_Bucolica_Georgic/h98WzOeMm08C?gbpv=1&pg=PA" + linkValue
      }     

      else if (["HB"].includes(field)) {
        if (linkValue.includes("2#")) {
          baseUrl = "https://www.google.com/books/edition/P_Virgilii_Maronis_opera/KaZoAAAAcAAJ?hl=en&gbpv=1&pg=PA"
        } else if (linkValue.includes("3#")) {
          baseUrl = "https://www.google.com/books/edition/P_Virgilii_Maronis_Opera/2_uuE78Nvx8C?hl=en&gbpv=1&pg=PA"
        } else {
          baseUrl = "https://www.google.com/books/edition/P_Virgilii_Maronis_opera/WeNWAAAAYAAJ?hl=en&gbpv=1&pg=PA"
        }
        linkValue = Math.floor(parseFloat(linkValue.slice(2)));
        constructedLink = baseUrl + linkValue
      }                      

      else if (["H3", "HW", "Hex"].includes(field)) {
        if (linkValue.includes("1#")) {
          baseUrl = "https://archive.org/details/bub_gb_u4pRAAAAcAAJ/page/"
        } else {
          baseUrl = "https://archive.org/details/bub_gb_gOXEF9Q4poMC/page/"
        }
        linkValue = Math.floor(parseFloat(linkValue.slice(2)));
        constructedLink = baseUrl + linkValue + "/mode/1up"
      }                      
      
      else if (["Con", "CN"].includes(field)) {
        if (linkValue.includes("1#")) {
          baseUrl = "https://archive.org/details/pvergilimaronis05nettgoog/page/"
        } else {
          baseUrl = "https://archive.org/details/pvergilimaroniso03virg/page/"
        }
        linkValue = Math.floor(parseFloat(linkValue.slice(2)));
        constructedLink = baseUrl + linkValue + "/mode/1up";
      }                        

      else if (["For"].includes(field)) {
        if (linkValue.includes("1#")) {
          baseUrl = "https://www.google.com/books/edition/Opera_ad_optimorum_librorum_fidem_edidit/5nJHAQAAMAAJ?hl=en&gbpv=1&pg=PA"
        } else {
          baseUrl = "https://www.google.com/books/edition/P_Vergili_Maronis_Opera_ad_optimorum_lib/VVAKAQAAMAAJ?hl=en&gbpv=1&pg=PA"
          
        }
        linkValue = Math.floor(parseFloat(linkValue.slice(2)));
        constructedLink = baseUrl + linkValue
      }                      

      else if (["Pkp"].includes(field)) {
        if (linkValue.includes("1#")) {
          linkValue = Math.floor(parseFloat(linkValue.slice(2))) + 6;
          baseUrl = "https://archive.org/details/bub_gb_JaswLPQBvv8C/page/n"
        } else {
          linkValue = Math.floor(parseFloat(linkValue.slice(2)));
          baseUrl = "https://archive.org/details/bub_gb_PZgneqs091EC/page/"
          
        }
        constructedLink = baseUrl + linkValue + "/mode/1up";
      }                      
      
      else if (["Hen"].includes(field)) {
        // first volume is OK
        if (linkValue.includes("1#")) {
          baseUrl = "https://archive.org/details/cu31924087959908/page/"
          linkValue = Math.floor(parseFloat(linkValue.slice(2)));
        } else if (linkValue.includes("2#")) {
        // second volume is OK; some "nXX" pages are in the csv
          baseUrl = "https://archive.org/details/cu31924087959916/page/"
          if (!linkValue.includes("n")) {
            linkValue = Math.floor(parseFloat(linkValue.slice(2)));
          } else {
            linkValue = linkValue.slice(2);
          }
        } else if (linkValue.includes("3#")) {
          if (linkValue.includes("n")) {
            linkValue = linkValue.slice(2);
            baseUrl = "https://archive.org/details/cu31924087959924/page/"          
          } else {
            if (Math.floor(parseFloat(linkValue.slice(2))) < 209) {
              linkValue = Math.floor(parseFloat(linkValue.slice(2)))+11;
              baseUrl = "https://archive.org/details/cu31924087959924/page/n"
            } else if (Math.floor(parseFloat(linkValue.slice(2))) < 331) {
              linkValue = Math.floor(parseFloat(linkValue.slice(2)))+13;
              baseUrl = "https://archive.org/details/cu31924087959924/page/n"
            } else {
              linkValue = Math.floor(parseFloat(linkValue.slice(2)));
              baseUrl = "https://archive.org/details/cu31924087959924/page/"
            }
          }
        } else {
          if (Math.floor(parseFloat(linkValue.slice(2))) == 3) {
            linkValue = "n976";
          } else if (Math.floor(parseFloat(linkValue.slice(2))) == 330) {
            linkValue = "n1303";
          } else {
            linkValue = Math.floor(parseFloat(linkValue.slice(2)));
          }           
          baseUrl = "https://archive.org/details/cu31924087959924/page/"
        }

        constructedLink = baseUrl + linkValue 
        
        if (constructedLink.includes("archive.org")) {
          constructedLink = constructedLink + "/mode/1up";
        }
      }                        
      
      else if (["Kap"].includes(field)) {
        if (linkValue.includes("1#")) {
          baseUrl = "https://babel.hathitrust.org/cgi/pt?id=mdp.39015027628067&seq="
          linkValue = Math.floor(parseFloat(linkValue.slice(2))) + 12;
        } else if (linkValue.includes("2#")) {
          baseUrl = "https://babel.hathitrust.org/cgi/pt?id=mdp.39015027628067&seq="
          linkValue = Math.floor(parseFloat(linkValue.slice(2))) + 128;
        } else if (linkValue.includes("3#")) {
          baseUrl = "https://babel.hathitrust.org/cgi/pt?id=mdp.39015027628067&seq="
          linkValue = Math.floor(parseFloat(linkValue.slice(2))) + 256;
        } else {
          baseUrl = "https://babel.hathitrust.org/cgi/pt?id=uc1.b3114559&seq="
          linkValue = Math.floor(parseFloat(linkValue.slice(2))) + 406;
        }
        constructedLink = baseUrl + linkValue;
      }                        
      
      
      else if (["Wnr"].includes(field)) {
        linkValue = Math.floor(parseFloat(linkValue));
        baseUrl = "https://archive.org/details/commentarzuvergi00weiduoft/page/"
        constructedLink = baseUrl + linkValue + "/mode/1up";
      }
      
      else if (["Lwg"].includes(field)) {
        if (linkValue.includes("1#")) {
          baseUrl = "https://www.google.com/books/edition/Vergils_Gedichte/R6BRMxAj1WQC?hl=en&gbpv=1&pg=PA"
        } else {
          baseUrl = "https://www.google.com/books/edition/Vergils_Gedichte/R6BRMxAj1WQC?hl=en&gbpv=1&pg=RA1-PA"
        }
        linkValue = Math.floor(parseFloat(linkValue.slice(2)));
        constructedLink = baseUrl + linkValue
      }          
      
      
      else if (["Pge", "Pag"].includes(field)) {
        if (linkValue.includes("1#")) {
          baseUrl = "https://archive.org/details/aeneidofvirgil01virg/page/"
          linkValue = Math.floor(parseFloat(linkValue.slice(2)));
          constructedLink = baseUrl + linkValue + "/mode/1up";
        } else {
          baseUrl = "https://babel.hathitrust.org/cgi/pt?id=mdp.39015008847496&seq="
          linkValue = Math.floor(parseFloat(linkValue.slice(2))) + 28;
          constructedLink = baseUrl + linkValue;
        }
      }      
      
      else if (["N1"].includes(field)) {
        linkValue = Math.floor(parseFloat(linkValue));
        baseUrl = "https://archive.org/details/pvergiliusmaroa00virggoog/page/"
        constructedLink = baseUrl + linkValue + "/mode/1up";
      }
      
      else if (["N2", "N3"].includes(field)) {
        linkValue = Math.floor(parseFloat(linkValue));
        baseUrl = "https://archive.org/details/pvergiliusmaroae00virg_0/page/"
        constructedLink = baseUrl + linkValue + "/mode/1up";
      }            
      
      //FURTHER COMMENTARIES COME HERE
                  
      current_cell_link = constructedLink;
      return constructedLink;
    }
