function showTab(id){
['dash','maint','inv','set'].forEach(x=>{
document.getElementById(x).style.display = x===id?'block':'none';
});
}