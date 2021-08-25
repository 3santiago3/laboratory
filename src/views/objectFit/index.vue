<template>
  <div class="object-fit-demo">
    <div>{{ imgSrc }}</div>

    <el-button-group>
      <el-button @click="imgSrc = '/static/300×300.png'">300 × 300</el-button>
      <el-button @click="imgSrc = '/static/100×100.png'">100 × 100</el-button>
    </el-button-group>

    <el-button-group>
      <el-button @click="imgSrc = '/static/400×300.png'">400 × 300</el-button>
      <el-button @click="imgSrc = '/static/400×100.png'">400 × 100</el-button>
      <el-button @click="imgSrc = '/static/150×100.png'">150 × 100</el-button>
    </el-button-group>

    <el-button-group>
      <el-button @click="imgSrc = '/static/300×400.png'">300 × 400</el-button>
      <el-button @click="imgSrc = '/static/100×400.png'">100 × 400</el-button>
      <el-button @click="imgSrc = '/static/100×150.png'">100 × 150</el-button>
    </el-button-group>

    <div class="wrapper-1">
      <div class="inner">
        <div v-show="!imgSrc" class="text">签署位置</div>
        <div
          v-show="!imgSrc"
          :style="{ height: SHOW_DATE_HEIGHT + 'px' }"
          class="show-date without-img"
        >
          2021年7月13日
        </div>
        <div
          v-show="imgSrc"
          :style="{
            'max-height': 'calc(100% - ' + SHOW_DATE_HEIGHT * 2 + 'px);'
          }"
          class="img-wrapper"
        >
          <i class="el-icon-close" @click="imgSrc = ''" />
          <img ref="img1" :src="imgSrc" alt="" @load="handleImgLoad">
          <div
            v-show="imgSrc"
            :style="{ height: SHOW_DATE_HEIGHT + 'px' }"
            class="show-date with-img"
          >
            2021年7月13日
          </div>
        </div>
      </div>
    </div>

    <div class="wrapper-2">
      <div class="inner">
        <div v-show="!imgSrc" class="text">签署位置</div>
        <div
          v-show="!imgSrc"
          class="show-date without-img"
          :style="{ height: SHOW_DATE_HEIGHT + 'px' }"
        >
          2021年7月13日
        </div>
        <div v-show="imgSrc" class="img-wrapper">
          <i class="el-icon-close" @click="imgSrc = ''" />
          <img ref="img2" :src="imgSrc" alt="" @load="handleImgLoad">
          <div
            v-show="imgSrc"
            class="show-date with-img"
            :style="{ height: SHOW_DATE_HEIGHT + 'px' }"
          >
            2021年7月13日
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const SHOW_DATE_HEIGHT = 40

export default {
  name: 'ObjectFit',
  data() {
    return {
      imgSrc: '',
      SHOW_DATE_HEIGHT
    }
  },
  watch: {
    imgSrc: {
      handler() {
        const imgElement1 = this.$refs.img1
        const imgElement2 = this.$refs.img2
        const arr = [imgElement1, imgElement2]
        arr.forEach(imgElement => {
          const parentElement = imgElement.parentNode

          parentElement.style.width = 'auto'
          parentElement.style.height = 'auto'
          imgElement.style.width = 'auto'
          imgElement.style.height = 'auto'
          imgElement.style.visibility = 'hidden'
        })
      }
    }
  },
  methods: {
    handleImgLoad(e) {
      const imgElement = e.target // img 元素
      const imgClientWidth = imgElement.clientWidth // img 元素宽度
      const imgClientHeight = imgElement.clientHeight // img 元素高度

      const parentElement = imgElement.parentNode // imgWrapper 元素

      const grandParentElement = parentElement.parentNode // inner 元素
      const grandParentClientWidth = grandParentElement.clientWidth // inner 元素宽度
      const grandParentClientHeight = grandParentElement.clientHeight // inner 元素高度

      const parentStyleMaxWidth = grandParentClientWidth // // imgWrapper 元素最大宽度 100%
      const parentStyleMaxHeight =
        grandParentClientHeight - SHOW_DATE_HEIGHT * 2 // imgWrapper 元素最大高度 100% - SHOW_DATE_HEIGHT * 2

      // 容器最大宽高比
      const parentAspectRatio = parentStyleMaxWidth / parentStyleMaxHeight

      // 图片宽高比
      const imgAspectRatio = imgClientWidth / imgClientHeight

      if (parentAspectRatio > imgAspectRatio) {
        // 比较高度
        if (imgClientHeight > parentStyleMaxHeight) {
          parentElement.style.height = parentStyleMaxHeight + 'px'
          parentElement.style.width =
            parentStyleMaxHeight * imgAspectRatio + 'px'
        } else if (imgClientHeight <= parentStyleMaxHeight) {
          parentElement.style.width = imgClientWidth + 'px'
          parentElement.style.height = imgClientHeight + 'px'
        }
      } else if (parentAspectRatio <= imgAspectRatio) {
        // 比较宽度
        if (imgClientWidth > parentStyleMaxWidth) {
          parentElement.style.width = parentStyleMaxWidth + 'px'
          parentElement.style.height =
            parentStyleMaxWidth / imgAspectRatio + 'px'
        } else if (imgClientWidth <= parentStyleMaxWidth) {
          parentElement.style.width = imgClientWidth + 'px'
          parentElement.style.height = imgClientHeight + 'px'
        }
      }

      imgElement.style.width = '100%'
      imgElement.style.height = '100%'
      imgElement.style.visibility = 'visible'
    }
  }
}
</script>

<style lang="scss" scoped>
.el-button-group {
  margin-left: 10px;
  margin-top: 10px;
}

.wrapper-1,
.wrapper-2 {
  border: 1px dashed blue;
  position: relative;
  position: absolute;
  top: 150px;
}

.wrapper-1 {
  left: 100px;
}

.wrapper-2 {
  left: 400px;
}

.wrapper-1 {
  height: 180px;
  width: 200px;
  .img-wrapper {
    &::after {
      content: '198 × 138';
      position: absolute;
      right: -86px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}

.wrapper-2 {
  height: 200px;
  width: 120px;
  .img-wrapper {
    &::after {
      content: '118 × 158';
      position: absolute;
      right: -86px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}

/* 不影响的样式 */
.inner {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
  .text {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .show-date {
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px dashed red;
    // background-color: yellow;
  }
  .with-img {
    position: absolute;
    width: 1000%;
    text-align: center;
    left: 50%;
    transform: translateX(-50%);
  }
  .img-wrapper {
    .el-icon-close {
      position: absolute;
      right: 0;
      top: 0;
      cursor: pointer;
      z-index: 9;
      &:hover {
        color: #337ee0;
        font-weight: bold;
      }
    }
  }
}

.inner {
  .img-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    img {
      vertical-align: middle;
    }
  }
}
</style>
