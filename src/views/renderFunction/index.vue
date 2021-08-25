<template>
  <div class="render-function">
    <anchored-heading :level="1">
      <template v-slot:default>
        <div>
          Hello world!
          <span>我是你</span>
        </div>
      </template>
    </anchored-heading>
    <!-- <anchored-heading :level="2">I am your father!</anchored-heading> -->
  </div>
</template>

<script>
import AnchoredHeading from './AnchoredHeading'

export default {
  name: 'RenderFunction',
  components: {
    AnchoredHeading
  }
}
</script>
