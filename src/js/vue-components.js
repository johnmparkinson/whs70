if (!window.moment) { window.moment = function (str) { return str; }; }

var eventBus = new Vue({});

Vue.component('people-listing', {
    template: '#people-template',
    data: function () {
        return {
            people: []
        }
    },
    created: function () {
        var that = this;

        fetch('/data/people.json')
            .then(results => results.json())

            .then(data => {
                this.people = data;
            });
    }
});

Vue.component('person', {
    template: '#person-template',
    props: ['person'],
    computed: { 
        originalUrl : function() {
            return '../img/1970/' + person.id + '.jpg';
        },
        currentUrl : function() {
            return '../img/current/' + person.id + '.jpg';
        }
    }
});

Vue.component('sort-selector', {
    template: "#sort-selector",
    props: ['sorton'],
    data: function () {
        return {
            items: [
                { id: "date", name: "Date" },
                { id: "name", name: "Title" }
            ],
            selected: this.$props.sorton || 'name'
        }
    },
    methods: {
        handleSelection: function (value) {
            eventBus.$emit('select-sort', value);
        }
    }
});

var sort_filter_truncate = function (data, filter, field, sortOn, overridesortOn, top) {

    var filteredData,
        filteredLength;

    //filter
    if (data.length > 0 && filter != '') {
        if (field) {
            if (Array.isArray(data[0][field])) {
                if (filter && field) {
                    filteredData = data.filter(function (d) {
                        if (d[field]) {
                            return d[field].indexOf(filter) > -1;
                        } else { return false; }
                    });
                } else if (field) {
                    // what case is this?
                    filteredData = data.filter(d => (d[field].length > 0));
                }
            } else {
                if (filter && field) {
                    filteredData = data.filter(d => (d[field] === filter));
                }
            }
        }
        else {
            filteredData = data;
        }
    } else {
        filteredData = data;
    }

    filteredLength = filteredData.length;

    //sort
    if (filteredLength > 1) {
        if (Array.isArray(filteredData[0][sortOn])) {
            filteredData.sort(function (a, b) {
                if (a[sortOn][0] == b[sortOn][0]) {
                    if (a[sortOn][1] == b[sortOn][1]) {
                        
                        return b[sortOn][2] - a[sortOn][2];
                    } else {
                        return b[sortOn][1] - a[sortOn][1];
                    }
                } else {
                    return b[sortOn][0] - a[sortOn][0];
                }
            });
        } else {
            filteredData.sort(function (a, b) {
                var nameA = a[sortOn].toUpperCase();
                var nameB = b[sortOn].toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });
        }

        if (overridesortOn) {
            filteredData.sort(function (a, b) {
                return b[overridesortOn];
            });
        }
    }

    //top
    if (top) {
        filteredData = filteredData.slice(0, top);
    } 

    return { filteredLength: filteredLength, data: filteredData };
}

var sortbyfield = function (filteredData, sortOn ) {
    if (filteredData.length > 1) {
        if (Array.isArray(filteredData[0][sortOn])) {
            filteredData.sort(function (a, b) {
                if (a[sortOn][0] == b[sortOn][0]) {
                    if (a[sortOn][1] == b[sortOn][1]) {

                        return b[sortOn][2] - a[sortOn][2];
                    } else {
                        return b[sortOn][1] - a[sortOn][1];
                    }
                } else {
                    return b[sortOn][0] - a[sortOn][0];
                }
            });
        } else {
            filteredData.sort(function (a, b) {
                var nameA = a[sortOn].toUpperCase();
                var nameB = b[sortOn].toUpperCase();
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            });
        }
    }
}

var sortUnique = function (arr) {
    return arr.sort().reduce(function (p, c) {
        if (p.indexOf(c) < 0) {
            p.push(c);
        }
        return p;
    }, []);
}

