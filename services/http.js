import jQuery from 'jquery';

export default [function(){
    function Http() {
        this.get = jQuery.get;
        this.post = jQuery.post;
    }

    return new Http();
}];
