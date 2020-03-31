<template>
    <v-app>
        <v-content>
            <FileList/>
        </v-content>
    </v-app>
</template>

<script>
  import FileList from '@/components/FileList';

  export default {
    name: 'App',

    components: {
      FileList,
    },

    data: () => ({
      //
    }),
  };
</script>
