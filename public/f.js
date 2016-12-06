Vue.component('file', {
	props: ['file'],
	template: '<li>' +
		'<i class="material-icons">folder</i>' +
		'<span @click="toggle" class="folder">{{ file.name }}</span>' + 
		'<span :class="{ showPath: expanded }" class="hidePath">{{ file.path }}' +
		' <a :href="fullPath" target="_blank">Open</a></span>' +
		'</li>',
	data: function() {
		return { expanded: false };
	},
	computed: {
		fullPath: function() {
			return (this.file.path + '\\' + this.file.name);
		}
	},
	methods: {
		toggle: function() {
			this.expanded = !this.expanded;
		}
	}
});

var app = new Vue({
	el: '#app',
	data: {
		searchQuery: '',
		loading: false,
		files: []
	},
	created: function() {
		this.getFiles();
	},
	watch: {
		searchQuery: function() {
			this.loading = true;
			this.getFiles();
		}
	},
	methods: {
		getFiles: _.debounce(function() {
			var options = { 
				emulateJSON: true,
				params: { q: this.searchQuery }
			};
			this.$http.get('/files', options).then(function(res) {
				this.loading = false;
				this.files = res.data;
			});
		}, 400)
	}
});
