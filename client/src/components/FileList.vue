<template>
    <v-container>
        <v-text-field
                v-model="path"
                prepend-icon="explore"
                disabled
                :loading="isFetching"
        >
        </v-text-field>
        <v-simple-table>
            <template v-slot:default>
                <thead>
                <tr>
                    <th class="text-left">Name</th>
                    <th class="text-left">Size</th>
                    <th class="text-left">Modified</th>
                </tr>
                </thead>
                <tbody>
                <tr @click="handleBack">
                    <td>
                        <v-icon>folder_open</v-icon>
                        ...
                    </td>
                    <td></td>
                    <td></td>
                </tr>
                <tr v-for="file in orderedFiles" :key="file.path"
                    @click="handleFileSelect(file)"
                >
                    <td>
                        <v-icon>{{file | formatIcon}}</v-icon>
                        {{ file.fileName }}
                    </td>
                    <td>{{ file | formatSize }}</td>
                    <td>{{ file.modifiedDate }}</td>
                </tr>
                </tbody>
            </template>
        </v-simple-table>
    </v-container>
</template>

<script>
  import path from 'path';

  function formatItemsCount(count) {
    return `${count > 0 ? count : '?'} item${count === 1 ? '' : 's'}`;
  }

  function formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  export default {
    name: 'FileList',
    data() {
      return {
        path: '/',
        files: [],
        isFetching: false,
      };
    },
    mounted() {
      this.fetchFileList();
    },
    methods: {
      fetchFileList() {
        this.isFetching = true;
        fetch(new URL('/api' + this.path, 'http://localhost:3000/api/'))
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            this.files = data;
          })
          .finally(() => {
            this.isFetching = false;
          });
      },
      handleFileSelect(file) {
        if (this.isFetching) return;

        if (file.type === 'file') return;
        this.path = path.resolve(this.path, file.fileName);
        console.log(this.path);
        this.fetchFileList();
      },
      handleBack() {
        if (this.isFetching) return;

        const pathParts = this.path.split('/');
        const backPath = path.resolve(...pathParts.slice(0, pathParts.length - 1));
        this.path = backPath;
        this.fetchFileList();
      },
    },
    computed: {
      orderedFiles() {
        return [...this.files].sort((a, b) => {
          // Order by type
          if (a.type === 'file' && b.type === 'directory') return 1;
          if (a.type === 'directory' && b.type === 'file') return -1;

          // Order by name
          if (a.fileName > b.fileName) return 1;
          if (b.fileName > a.fileName) return -1;
          return 0;
        });
      },
    },
    filters: {
      formatSize(file) {
        switch (file.type) {
          case 'file':
            return formatFileSize(file.size);
          case 'directory':
            return formatItemsCount(file.itemsCount);
        }
      },
      formatIcon(file) {
        if (file.type === 'file') return 'description';
        if (file.type === 'directory') return 'folder';
      },
    },
  };
</script>

<style scoped>
    tbody > tr {
        cursor: pointer;
    }
</style>