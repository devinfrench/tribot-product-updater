<template>
  <EditProduct />
</template>

<script>
import EditProduct from './components/EditProduct.vue'

export default {
  name: 'App',
  components: {
    EditProduct
  }
}

document.title = "TRiBot Product Updater";
</script>

<style>
html {
  height: 100%;
  width: 100%;
  overflow: hidden !important;
}

body {
  height: 100%;
  width: 100%;
}

#app {
  height: 100%;
  width: 100%;
}
</style>
