<template>
  <div
    class="user-pic"
    :class="[
      img,
      classNames,
      editable ? 'editable' : '',
      clickable ? 'clickable' : '',
      withHalo ? 'with-halo' : '',
    ]"
    :style="{ '--size': `${size}px` }"
    @click="$emit('on-click')"
  >
    <div
      v-if="editable"
      class="edit-text"
    >
      {{ $t("Edit") }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfilePicture',
  props: {
    img: {
      type: String,
      default: 'profile-img-1',
    },
    editable: {
      type: Boolean,
      default: false,
    },
    clickable: {
      type: Boolean,
      default: false,
    },
    size: {
      type: Number,
      default: 100,
    },
    classNames: {
      type: String,
      default: '',
    },
    withHalo: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['on-click'],
};
</script>

<style lang="less" scoped>
@image-url: "./../../../assets/images";

.user-pic {
  min-height: var(--size);
  min-width: var(--size);
  max-height: var(--size);
  max-width: var(--size);
  background: url("@{image-url}/mr-evocon-1@3x.png") no-repeat;
  background-size: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;

  &.clickable {
    cursor: pointer;
  }

  &.editable {
    cursor: pointer;

    .edit-text {
      display: none;
      color: white;
    }

    &:hover {
      opacity: 0.35;
      .edit-text {
        display: block;
      }
    }
  }

  &.profile-img-1 {
    background: url("@{image-url}/mr-evocon-1@3x.png") no-repeat;
    background-size: cover;
  }

  &.profile-img-2 {
    background: url("@{image-url}/mr-evocon-2@3x.png") no-repeat;
    background-size: cover;
  }

  &.profile-img-3 {
    background: url("@{image-url}/mr-evocon-3@3x.png") no-repeat;
    background-size: cover;
  }

  &.profile-img-4 {
    background: url("@{image-url}/mr-evocon-4@3x.png") no-repeat;
    background-size: cover;
  }

  &.profile-img-5 {
    background: url("@{image-url}/mr-evocon-5@3x.png") no-repeat;
    background-size: cover;
  }

  &.profile-img-6 {
    background: url("@{image-url}/mr-evocon-6@3x.png") no-repeat;
    background-size: cover;
  }

  &.profile-img-7 {
    background: url("@{image-url}/mr-evocon-7@3x.png") no-repeat;
    background-size: cover;
  }

  &.selected {
    border: 2px solid rgb(var(--v-theme-secondary-dark));
    background-size: calc(100% - 4px);
    background-position: center;
  }

  &.with-halo {
    box-sizing: unset;
    border: 2px solid rgb(var(--v-theme-primary));

    &:before {
      content: "";
      height: var(--size);
      width: var(--size);
      position: absolute;
      border-radius: 50%;
      border: 4px solid rgb(var(--v-theme-primary));
      opacity: 0.5;
      box-sizing: unset;
    }

    &:after {
      content: "";
      height: var(--size);
      width: var(--size);
      position: absolute;
      border-radius: 50%;
      border: 6px solid rgb(var(--v-theme-primary));
      opacity: 0.2;
      box-sizing: unset;
    }
  }
}
</style>
