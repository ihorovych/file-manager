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

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component';

  enum FileItemType {
    file = 'file',
    directory = 'directory',
  }

  interface FileData {
    fileName: string;
    path: string;
    modifiedDate: Date;
    size: number;
    itemsCount: number;
    type: FileItemType;
  }

  function resolvePath(...args: string[]): string {
    const pathParts: string[] = args.reduce((acc: string[], el: string): string[] => {
      const pathParts = el
        .trim()
        .split('/')
        .filter((el: string): boolean => !!el);
      return [...acc, ...pathParts]
    }, [""]);
    return pathParts.join('/') || '/'
  }

  function formatItemsCount(count: number) {
    return `${count > 0 ? count : '?'} item${count === 1 ? '' : 's'}`;
  }

  function formatFileSize(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  @Component({
    name: 'FileList',
    filters: {
      formatSize(file: FileData) {
        switch (file.type) {
          case 'file':
            return formatFileSize(file.size);
          case 'directory':
            return formatItemsCount(file.itemsCount);
          default:
            return ''
        }
      },
      formatIcon(file: FileData) {
        if (file.type === 'file') return 'description'
        if (file.type === 'directory') return 'folder';
      }
      ,
    },
  })
  export default class FileList extends Vue {
    path = '/';
    files: FileData[] = [];
    isFetching = false;


    mounted() {
      this.fetchFileList();
    }

    fetchFileList(): void {
      this.isFetching = true;
      const url: string = new URL('/api' + this.path, 'http://localhost:3000/api/').toString()
      fetch(url)
        .then((response: any) => {
          return response.json();
        })
        .then((data: FileData[]) => {
          this.files = data;
        })
        .finally(() => {
          this.isFetching = false;
        });
    }

    handleFileSelect(file: FileData): void {
      if (this.isFetching) return;

      if (file.type === 'file') return;
      this.path = resolvePath(this.path, file.fileName);
      this.fetchFileList();
    }

    handleBack(): void {
      if (this.isFetching) return;

      const pathParts = this.path.split('/');
      const backPath = resolvePath(...pathParts.slice(0, pathParts.length - 1));
      this.path = backPath;
      this.fetchFileList();
    }

    get orderedFiles(): FileData[] {
      return [...this.files].sort((a: FileData, b: FileData): number => {
        // Order by type
        if (a.type === 'file' && b.type === 'directory') return 1;
        if (a.type === 'directory' && b.type === 'file') return -1;

        // Order by name
        if (a.fileName > b.fileName) return 1;
        if (b.fileName > a.fileName) return -1;
        return 0;
      });
    }
  }
</script>

<style scoped>
    tbody > tr {
        cursor: pointer;
    }
</style>