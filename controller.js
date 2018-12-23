module.exports=(url,onGet,onPost,ajax)=>{
    return {
        url:url,
        onGet:onGet,
        onPost:onPost,
        ajax:ajax
    }
}