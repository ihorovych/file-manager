<template>
    <v-app>
        <FileList/>
    </v-app>
</template>

<script lang="ts">
  import Vue from 'vue';
  import Component from 'vue-class-component'

  import FileList from '@/components/FileList.vue'

  @Component({
    name: 'App',
    components: {
      FileList
    },
  })
  export default class App extends Vue {
  }

</script>
