<template>
  <Teleport to="#title-bar">
    <n-input-group v-show="isActivated" class="flex-1">
      <n-input
        ref="searchBarEle"
        v-model:value="searchText"
        round
        clearable
        :disabled="props.loading"
        @keydown.enter="doSearch"
      >
        <template #prefix>
          <!-- show search icon only if searched text is empty -->
          <icon
            v-if="!searchedText"
            icon="fluent:search-20-regular"
            :width="20"
          />
          <!-- show cancel icon only if searched text is not empty -->
          <n-button
            v-else
            circle
            quaternary
            size="tiny"
            :disabled="props.loading"
            @click="cancelSearch"
          >
            <template #icon>
              <n-icon :size="20">
                <icon v-if="searchText" icon="fluent:arrow-left-20-regular" />
              </n-icon>
            </template>
          </n-button>
        </template>
      </n-input>
      <n-button round secondary :disabled="props.loading" @click="doSearch">
        {{ t("github-files.btn-search") }}
      </n-button>
    </n-input-group>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onActivated, onDeactivated } from "vue";
import { useI18n } from "vue-i18n";
import { Icon } from "@iconify/vue";

const { t } = useI18n();
const emit = defineEmits(["search"]);
const searchBarEle = ref();
const searchText = defineModel<string>("search-text", { required: true });
const props = defineProps<{
  loading: boolean;
}>();
const searchedText = ref("");

const isActivated = ref(false);
onActivated(() => {
  isActivated.value = true;
});
onDeactivated(() => {
  isActivated.value = false;
});

function cancelSearch(): void {
  searchText.value = ``;
  // do search only if non empty string have been searched
  if (searchedText.value !== "") emit("search");
  // clear searched text
  searchedText.value = "";
  // cancel focus on search bar
  searchBarEle.value.blur();
}

function doSearch(): void {
  if (props.loading) return;
  searchedText.value = searchText.value;
  emit("search");
}
</script>

<style scoped></style>
