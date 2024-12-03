module.exports = {
    formatDate: function (date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString();
    },
    toLowerCase: function (str) {
        return str.toLowerCase();
    }
}; 