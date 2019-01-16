// Script (C) 2012 by Mark Rosenfelder.
// You can modify the code for non-commercial use; 
// attribution would be nice.
// If you want to make money off it, please contact me.

// Modified by Jason Tamez 2017-2019.
// Non-minified code available here: https://github.com/jasontamez/wordgen

// ==ClosureCompiler==
// @compilation_level SIMPLE_OPTIMIZATIONS
// ==/ClosureCompiler==

var NLEX=150,NSENT=30,word,output,punc=".?!",cat,ncat,catindex="",badcats,syl,nsyl,wisyl,nwisyl,wfsyl,nwfsyl,snsyl,nsnsyl,monosyl=0,dropoff=50,rew,nrew,showsyl=!1,slowsyl=!1,tempArray=[],CustomInfo=!1,Customizable=!1,zCounter;function find(a,b){for(var c=0;c<a.length;c++)if(a.charAt(c)==b)return c;return-1}
function readStuff(){cat=$("#cats").val().split("\n");ncat=cat.length;badcats=!1;catindex="";var a;for(a=0;a<ncat;a++){var b=cat[a];13==b.charCodeAt(b.length-1)&&(b=b.substr(0,b.length-1),cat[a]=b);0===b.length&&a==ncat-1?ncat--:3>b.length?badcats=!0:-1==find(b,"=")?badcats=!0:catindex+=b.charAt(0)}a=$("#syls").val().split("\n");syl=parseSyllables(a);nsyl=syl.length;a=$("#wrdi").val().split("\n");wisyl=parseSyllables(a);nwisyl=wisyl.length;a=$("#wrdf").val().split("\n");wfsyl=parseSyllables(a);nwfsyl=
wfsyl.length;a=$("#sing").val().split("\n");snsyl=parseSyllables(a);nsnsyl=snsyl.length}function parseSyllables(a){var b;for(b=0;b<a.length;b++){var c=a[b];13==c.charCodeAt(c.length-1)&&(a[b]=c.substr(0,c.length-1))}return a}function randpct(){return Math.floor(101*Math.random())}function rewriterules(){var a;for(a=0;a<nrew;a++)if(2<rew[a].length&&0<rew[a].indexOf("||")){var b=rew[a].split("||");var c=new RegExp(b[0],"g");word=word.replace(c,b[1])}}
function rewriterulesStr(a){var b;for(b=0;b<nrew;b++)if(2<rew[b].length&&0<rew[b].indexOf("||")){var c=rew[b].split("||");var e=new RegExp(c[0],"g");a=a.replace(e,c[1])}return a}function PowerLaw(a,b){var c;for(c=0;;c=(c+1)%a)if(randpct()<b)return c}function PeakedPowerLaw(a,b,c){return.5<Math.random()?b+PowerLaw(a-b,c):b-PowerLaw(b+1,c)}
function Syllable(a){a=syllPatternPick(a);var b;for(b=0;b<a.length;b++){var c=a.charAt(b);var e=find(catindex,c);-1==e?word+=c:(c=cat[e].substr(2),e=0===dropoff?Math.random()*c.length:PowerLaw(c.length,dropoff),c=c.charAt(e),word+=c)}}function syllPatternPick(a){switch(a){case -1:var b=nwisyl;var c=wisyl;break;case 0:b=nsyl;c=syl;break;case 1:b=nwfsyl;c=wfsyl;break;case 2:b=nsnsyl,c=snsyl}a=PowerLaw(b,calcDropoff(b));return c[a]}
function OneWord(a){word="";var b=1,c;Math.random()>monosyl&&(b+=1+PowerLaw(4,50));var e=$("#onetype").prop("checked");var d=-1;for(c=0;c<b;c++)e?d=-1:1==b?d=2:0<c&&(d=1,c<b-1&&(d=0)),Syllable(d),showsyl&&c<b-1&&(word+="\u00b7");rewriterules();a&&(word=word.charAt(0).toUpperCase()+word.substring(1));output+=word}function CreateText(){var a,b;for(a=0;a<NSENT;a++){var c=1+PeakedPowerLaw(15,5,50);for(b=0;b<c;b++)OneWord(0===b),b==c-1&&(output+=punc.charAt(PowerLaw(punc.length,75))),output+=" "}}
function CreateLex(a){var b;output+='<div class="lexicon"><table>\n';for(b=0;b<NLEX;b++)0===b%10&&(output+="<tr>"),output+="<td>",OneWord(a),output+="</td>",9==b%10&&(output+="</tr>\n");output+="</table></div>\n"}function CreateLongLex(){var a;for(a=0;a<5*NLEX;a++)OneWord(!1),output+="<br>\n"}
function genall(a,b){if(0!==b.length){var c=b[0],e=1==b.length;var d=find(catindex,c);if(-1==d)e?tempArray.push(rewriterulesStr(a+c)):genall(a+c,b.slice(1));else{var f=cat[d].substr(2);for(c=0;c<f.length;c++)d=f.charAt(c),e?tempArray.push(rewriterulesStr(a+d)):genall(a+d,b.slice(1))}}}
function CreateAll(){tempArray=[];word="";var a,b=syl.concat(wisyl,wfsyl,snsyl);b.sort();var c=b.shift();for(a=[c];0<b.length;){var e=b.shift();e!=c&&(a.push(e),c=e)}e=a.length;for(c=0;c<e;c++)genall("",a[c]);tempArray=tempArray.sort();e="";for(c=0;c<tempArray.length;c++)if(a=tempArray[c],0===c||a!=e)word+=a+"<br>",e=a;output=word;tempArray=[]}
function handleCategoriesInRewriteRule(a){a=a.split("%%");for(var b=[],c,e,d,f;a.length;){c=a.shift().split("!%");for(d=c.shift();c.length;)f=c.shift(),e=f.charAt(0),e=find(catindex,e),-1!=e&&(d+="[^"+cat[e].substr(2)+"]"),d+=f.substr(1);c=d.split("%");for(d=c.shift();c.length;)f=c.shift(),e=f.charAt(0),e=find(catindex,e),-1!=e&&(d+="["+cat[e].substr(2)+"]"),d+=f.substr(1);b.push(d)}return b.join("%")}
function process(){var a,b=$("input[type=radio][name=outtype]:checked").val();showsyl=$("#showsyl").prop("checked");slowsyl=$("#slowsyl").prop("checked");monosyl=Number($("input[type=radio][name=monosyl]:checked").val());monosyl!=monosyl||1<monosyl?monosyl=1:0>monosyl&&(monosyl=0);dropoff=Number($("input[type=radio][name=dropoff]:checked").val());dropoff!=dropoff||45<dropoff?dropoff=45:0>dropoff&&(dropoff=0);output="";readStuff();rew=$("#rewrite").val().split("\n");nrew=rew.length;for(a=0;a<nrew;a++)-1!=
rew[a].indexOf("%")&&(rew[a]=handleCategoriesInRewriteRule(rew[a]));if(0>=ncat||0>=nsyl||0>=nwisyl||0>=nwfsyl||0>=nsnsyl)output="You must have categories and all syllable types to generate text.";else if(badcats)output="Categories must be of the form V=aeiou<br>That is, a single letter, an equal sign, then a list of possible expansions.";else switch(b){case "text":CreateText();break;case "dict":CreateLex(!1);break;case "dictC":CreateLex(!0);break;case "longdict":CreateLongLex();break;case "genall":CreateAll()}$("#outputText").html(output)}
function calcDropoff(a){return slowsyl?2==a?50:3==a?40:9>a?46-4*a:11:9>a?60-5*a:12}function erase(){$("#outputText").html("")}function clearBoxes(){$("#cats,#wrdi,#syls,#sing,#wrdf,#rewrite").val("");$("#monoLessFrequent,#dropoffMedium,#textOutput").prop("checked",!0);$("#onetype").prop("checked",!0);$("#showsyl,#slowsyl,#onetype").prop("checked",!1);$("#defaultName").text("")}function prepImport(){$("#importBoxArea").show();$("body").css("overflow","hidden")}
function removeImportBox(){$("#importTextBox").val("");$("#importBoxArea").hide();$("body").css("overflow","auto")}
function doImport(){var a=$("#importTextBox").val();a=/--CATS--\n([\s\S]*)\n--REWRITE--\n([\s\S]*)\n--MONO--\n([\s\S]*)\n--MID--\n([\s\S]*)\n--INIT--\n([\s\S]*)\n--FINAL--\n([\s\S]*)\n--FLAGS--\n([01]) ([01]) ([^ ]+) ([^ ]+)/.exec(a);if(null===a)return alert("Incorrect format.");$("#cats").val(a[1]);$("#rewrite").val(a[2]);$("#sing").val(a[3]);$("#syls").val(a[4]);$("#wrdi").val(a[5]);$("#wrdf").val(a[6]);$("#onetype").prop("checked","0"==a[7]?!1:!0);$("#slowsyl").prop("checked","0"==a[8]?!1:!0);
$("#"+a[9]).prop("checked",!0);$("#"+a[10]).prop("checked",!0);syllablicChangeDetection($("#onetype")[0]);alert("Import Successful!");$("#importTextBox").val("");$("#importBoxArea").hide();$("body").css("overflow","auto")}
function doExport(){var a="--CATS--\n"+$("#cats").val()+"\n--REWRITE--\n"+$("#rewrite").val()+"\n--MONO--\n"+$("#sing").val()+"\n--MID--\n"+$("#syls").val()+"\n--INIT--\n"+$("#wrdi").val()+"\n--FINAL--\n"+$("#wrdf").val()+"\n--FLAGS--\n"+($("#onetype").prop("checked")?"1":"0")+" "+($("#slowsyl").prop("checked")?"1":"0")+" "+$("input[name=monosyl]:checked").attr("id")+" "+$("input[name=dropoff]:checked").attr("id");$("#importTextBox").val(a);$("#importBoxArea").show();$("body").css("overflow","hidden");
alert("Export Successful. Copy this for your own records.\n\nHit 'Cancel' when you're done.")}
function saveCustom(){Customizable?CustomInfo&&!confirm("You already have information saved. Do you want to overwrite it?")?alert("Previous information saved."):(localStorage.setItem("CustomCats",$("#cats").val()),localStorage.setItem("CustomRewrite",$("#rewrite").val()),localStorage.setItem("CustomSing",$("#sing").val()),localStorage.setItem("CustomSyls",$("#syls").val()),localStorage.setItem("CustomWrdi",$("#wrdi").val()),localStorage.setItem("CustomWrdf",$("#wrdf").val()),localStorage.setItem("CustomOneType",
$("#onetype").prop("checked")),localStorage.setItem("CustomSlowsyl",$("#slowsyl").prop("checked")),localStorage.setItem("CustomMono",$("input[name=monosyl]:checked").attr("id")),localStorage.setItem("CustomDropoff",$("input[name=dropoff]:checked").attr("id")),CustomInfo=!0,1>$("#predef option[value=-1]").length&&$("#predef").prepend('<option value="-1">Custom</option>'),$("#predef").val("-1"),alert("Saved to browser.")):alert("Your browser does not support Local Storage and cannot save your information.")}
function clearCustom(){Customizable?CustomInfo?confirm("Are you sure you want to delete your saved settings?")?(window.localStorage.clear(),CustomInfo=!1,$("#predef option[value=-1]").remove(),alert("Cleared from browser.")):alert("Settings saved."):alert("You don't have anything saved."):alert("Your browser does not support Local Storage and cannot save your information.")}
function showipa(){word='<span class="desc">Latin:</span>\n<div class="extraGroup">';var a=[161,191,216,248,11360,42786,42891,42928,43824,43872,"x",592,"x",880,886,890,902,904,908,910,931,"x",1024,1162,42560,42624,"x",1329,1377],b=[161,214,246,591,11391,42887,42925,42935,43866,43877,"IPA",767,"Greek and Coptic",883,887,895,902,906,908,929,1023,"Cyrillic",1154,1327,42606,42651,"Armenian",1366,1415],c,e;var d=0;for(e=a.length;d<e;d++)if("x"===a[d])word+='</div>\n<br><br><span class="desc">'+b[d]+':</span>\n<div class="extraGroup">';
else for(c=a[d];c<=b[d];c++)word+='<span title="'+c+": "+getUnicodeName(c)+'">'+String.fromCharCode(c)+"</span>";word+="</div>\n";$("#outputText").html(word)}function advancedOptions(){$("#advancedOpen").toggleClass("closed")}
function defaultme(a){switch(a){case -1:CustomInfo?($("#cats").val(localStorage.getItem("CustomCats")),$("#rewrite").val(localStorage.getItem("CustomRewrite")),$("#sing").val(localStorage.getItem("CustomSing")),$("#syls").val(localStorage.getItem("CustomSyls")),$("#wrdi").val(localStorage.getItem("CustomWrdi")),$("#wrdf").val(localStorage.getItem("CustomWrdf")),$("#onetype").prop("checked","true"===localStorage.getItem("CustomOneType")),$("#slowsyl").prop("checked","true"===localStorage.getItem("CustomSlowsyl")),
$("#"+localStorage.getItem("CustomMono")).prop("checked",!0),$("#"+localStorage.getItem("CustomDropoff")).prop("checked",!0)):defaultme(0);break;case 1:$("#cats").val("C=ptkbdg\nR=rl\nV=ieaou");$("#wrdi").val("CV\nV\nCRV");$("#syls,#sing,#wrdf").val("");$("#onetype").prop("checked",!0);$("#slowsyl").prop("checked",!1);$("#rewrite").val("ki||"+String.fromCharCode(269)+"i");$("#monoLessFrequent,#dropoffMedium").prop("checked",!0);break;case 2:$("#cats").val("C=ptknslrmbdgfvwyh"+String.fromCharCode(353)+
"z"+String.fromCharCode(241)+"x"+String.fromCharCode(269,382,330)+"\nV=aiuoe"+String.fromCharCode(603,596,226,244,252,246)+"\nR=rly");$("#wrdi").val("CV\nV\nCVC\nCRV");$("#syls,#sing,#wrdf").val("");$("#rewrite").val(String.fromCharCode(226)+"||ai\n"+String.fromCharCode(244)+"||au");$("#onetype").prop("checked",!0);$("#slowsyl").prop("checked",!1);$("#monoLessFrequent,#dropoffMedium").prop("checked",!0);break;case 3:$("#cats").val("C=tkpnslrmfbdghvyh\nV=aiueo\nU=aiu"+String.fromCharCode(224,234)+
"\nR=rl\nM=nsrmltc\nK=ptkbdg");$("#wrdi").val("CV\nCUM\nV\nUM\nKRV\nKRUM");$("#syls,#sing,#wrdf").val("");$("#rewrite").val("ka||ca\nko||co\nku||cu\nkr||cr");$("#onetype").prop("checked",!0);$("#slowsyl").prop("checked",!1);$("#monoLessFrequent,#dropoffMedium").prop("checked",!0);break;case 4:$("#cats").val("C=tpknlrsm"+String.fromCharCode(654)+"bdg"+String.fromCharCode(241)+"fh\nV=aieuo"+String.fromCharCode(257,299,363,275,333)+"\nN=n"+String.fromCharCode(331));$("#wrdi").val("CV\nV\nCVN");$("#syls,#sing,#wrdf").val("");
$("#rewrite").val("aa||"+String.fromCharCode(257)+"\nii||"+String.fromCharCode(299)+"\nuu||"+String.fromCharCode(363)+"\nee||"+String.fromCharCode(275)+"\noo||"+String.fromCharCode(333)+"\nnb||mb\nnp||mp");$("#onetype").prop("checked",!0);$("#slowsyl").prop("checked",!1);$("#monoLessFrequent,#dropoffMedium").prop("checked",!0);break;case 5:$("#cats").val("C=ptknlsm"+String.fromCharCode(353)+"yw"+String.fromCharCode(269)+"hf"+String.fromCharCode(331)+"\nV=auieo\nR=rly\nN=nn"+String.fromCharCode(331)+
"mktp\nW=io\nQ=ptk"+String.fromCharCode(269));$("#wrdi").val("CV\nQ"+String.fromCharCode(688)+"V\nCVW\nCVN\nVN\nV\nQ"+String.fromCharCode(688)+"VN");$("#syls,#sing,#wrdf").val("");$("#rewrite").val("uu||wo\noo||ou\nii||iu\naa||ia\nee||ie");$("#slowsyl").prop("checked",!1);$("#onetype").prop("checked",!0);$("#monoLessFrequent,#dropoffMedium").prop("checked",!0);break;case 6:$("#cats").val("S=tspkThfS\nC=kstSplrLnstmTNfh\nI=aoueAOUE\nV=aoiueAOUE\nE=sfSnmNktpTh");$("#rewrite").val("([aeiou])\\1{2,}||$1$1\n([AEOU])\\1+||$1\n(%V{2})%V+||$1\nh+||h\nh(%V%E)\\b||H$1\nh(%V%C{0,2}%V)\\b||H$1\n(%V)h(%V)\\b||$1H$2\n\\bh||H\nh\\b||H\nh||\nH||h\nA||a"+
String.fromCharCode(301)+"\nO||o"+String.fromCharCode(301)+"\nU||u"+String.fromCharCode(301)+"\nE||e"+String.fromCharCode(301)+"\n"+String.fromCharCode(301)+"i||i\n"+String.fromCharCode(301)+"T||"+String.fromCharCode(301)+"t\n"+String.fromCharCode(301)+"S||"+String.fromCharCode(301)+"s\n"+String.fromCharCode(301)+"L||"+String.fromCharCode(301)+"l\n"+String.fromCharCode(301)+"N||"+String.fromCharCode(301)+"n\n(\\B.\\B[aeou])i||$1"+String.fromCharCode(301)+"\n(%C)\\1||$1\n[tkpT]r||r\nn[pTk]||nt\nm[tTk]||mp\nN[ptk]||NT\nk[nmN]||k\np[nN]||pm\nt[mN]||tn\nT[nm]||TN\np[sSh]||pf\nt[fSh]||ts\nT[fsh]||TS\nk[fsS]||kh\nf[sSh]||fp\ns[fSh]||st\nS[fsh]||ST\nh[fsS]||hk\nft||fp\nsT||st\nSt||ST\n([TSLN])[tsln]||$1\n([tsln])[TSLN]||$1\nNT||nT\nTN||tN\nST||sT\nTS||tS\nT||t"+
String.fromCharCode(769)+"\nL||"+String.fromCharCode(314)+"\nS||"+String.fromCharCode(347)+"\nN||"+String.fromCharCode(324));$("#sing").val("SV\nSVE\nSV\nSV");$("#syls").val("SV\nI\nCV\nSVC");$("#wrdi").val("SV\nV\nSVC");$("#wrdf").val("I\nVE\nV\nVE\nSVE\nV\nCV\nVE\nCVE");$("#onetype,#slowsyl").prop("checked",!1);$("#monoRare,#dropoffMedium").prop("checked",!0);break;case 7:$("#cats").val("I=rlmnpbBTRG\nC=pbtdkgnmGszSZwrlBTR\nE=pbtdkgnmGl\nM=pbtdkgnmGrlszSZw\nS=pbtdkg\nN=nmG\nX=szSZwrlnmG\nA=wrl\nV=aIuioe");
$("#rewrite").val("^(b|p)w||$1\n^G||w\n(%X)%X||$1\n(%N|%A)(%S)||$2\n%X(%S%A)||$1\n^g([ei])||gh$1\nG||ng\nS||sh\nZ||zh\ni||ee\nI||i\ni$||e\nB||"+String.fromCharCode(664)+"\nT||"+String.fromCharCode(451)+"\nR||"+String.fromCharCode(450));$("#sing").val("IVN\nVS\nCVE\nSAV\nSAVE\nCV\nCVN");$("#syls").val("SV\nNV\nMV\nSAV\nSV\nSV\nNV\nMV\nSAV\nSVX\nMVX\nSAVX");$("#wrdi").val("SV\nIV\nAV\nCV\nSAV\nVX\nSV\nIV\nAV\nCV\nSAV\nVX\nAVX\nCVX\nIVX\nVX\nSAVX");$("#wrdf").val("MV\nMVE\nMV\nMVE\nSAV\nSAVE");$("#onetype,#slowsyl").prop("checked",
!1);$("#monoFrequent,#dropoffSlow").prop("checked",!0);break;default:return alert("Choose something from the list, first.")}syllablicChangeDetection($("#onetype")[0])}function loadPredef(){var a=$("#predef").val();defaultme(Number(a))}function syllablicChangeDetection(a){a.checked?($("#p_multi,.multiswap").hide(),$(".singleswap").show()):($("#p_multi,.multiswap").show(),$(".singleswap").hide())}zCounter=1;
$(document).ready(function(){"undefined"!==typeof Storage&&(Customizable=!0,null!==localStorage.getItem("CustomCats")&&(CustomInfo=!0,$("#predef").prepend('<option value="-1">Custom</option>'),$("#predef").val("-1"),defaultme(-1)));$("#onetype").change(function(){syllablicChangeDetection($("#onetype")[0])});syllablicChangeDetection($("#onetype")[0]);$(".help").click(function(){var a=$(this).find("span.info");if($(this).hasClass("popOut")){var b=$(this).attr("data-clicked");if("undefined"!==typeof b)$("#"+
b).remove(),$(this).removeAttr("data-clicked");else{var c=$(this).offset();var e=a.html();++zCounter;b="popup"+zCounter;$(this).attr("data-clicked",b);$("body").append('<div class="info" id="'+b+'"></div>');a=$("#"+b);a.toggle();b=c.left;var d=a.width()+20;var f=$(document).width();var g=b+$(this).width();g+d>f&&(b=g<=d?f<=d?b-g+2:b+(f-(g+d))-3:b-d);a.html(e).css({"z-index":zCounter,top:c.top+10,left:b});a.click(function(){$('span[data-clicked="'+$(this).attr("id")+'"]').removeAttr("data-clicked");
$(this).remove()})}}else a.toggle(),a.css("transform","translateX(0px)"),a.is(":visible")&&(++zCounter,a.css("z-index",zCounter),d=a.width()+20,f=$(document).width(),c=$(this).offset(),g=c.left+$(this).width(),g+d>f&&(g<=d?f<=d?a.css("transform","translateX("+(2-g)+"px)"):a.css("transform","translateX("+(f-g-d)+"px)"):a.css("transform","translateX("+(0-d)+"px)")))})});