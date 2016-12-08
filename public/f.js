Vue.component('file', {
	props: ['file'],
	template: '<tr @click="onClick">' +
		'<td><i v-if="file.isDir" class="material-icons">folder</i></td>' +
		'<td><span class="folder">{{ file.name }}</span></td>' + 
		'</tr>',
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
		},
		onClick: function() {
			this.$emit('clicked', this.file);
		}
	}
});

var app = new Vue({
	el: '#app',
	data: {
		searchQuery: '',
		currentFolder: '',
		loading: false,
		results: [],
		folders: [],
		files: []
	},
	mounted: function() {
		this.getResults();
		//this.getFiles();
	},
	watch: {
		searchQuery: function() {
			if (this.searchQuery === '') return;
			this.loading = true;
			this.getFiles();
		},
		currentFolder: function() {
			this.loading = true;
			this.getFolder();
		}
	},
	methods: {
		copyFolder: function(e) {
			e.target.select();
			document.execCommand('copy');
		},
		onClickResult: function(e) {
			this.searchQuery = e.target.innerText;
		},
		onFolderSelected: function(file) {
			this.currentFolder = file.path + '\\' + file.name;
		},
		getResults: function() {
			this.$http.get('/recent').then(function(res) {
				this.results = res.data;
			});
		},
		getFiles: _.debounce(function() {
			var options = { 
				emulateJSON: true,
				params: { q: this.searchQuery }
			};
			this.$http.get('/files', options).then(function(res) {
				this.loading = false;
				this.folders = res.data;
			});
		}, 400),
		getFolder: function() {
			var options = { 
				emulateJSON: true,
				params: { q: this.currentFolder }
			};
			this.$http.get('/folder', options).then(function(res) {
				this.loading = false;
				this.files = res.data;
			});
		}
	}
});
