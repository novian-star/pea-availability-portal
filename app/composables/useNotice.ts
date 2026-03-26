type NoticeResponse = {
  data: {
    id: string;
    title: string | null;
    content: string | null;
    isEnabled: boolean;
    updatedAt: string;
  } | null;
};

export const useNotice = () => {
  const { data: notice, refresh } = useFetch<NoticeResponse>('/api/notice', {
    key: 'notice',
    default: () => ({ data: null }),
  });

  const noticeData = computed(() => notice.value?.data || null);

  const isEnabled = computed(() => noticeData.value?.isEnabled || false);

  const shouldShowPopup = computed(() => {
    if (!import.meta.client) return false;
    if (!noticeData.value || !isEnabled.value) return false;

    const updatedAt = noticeData.value.updatedAt;
    const storageKey = `notice-seen-${updatedAt}`;

    // Check if user has already seen this version of the notice in this session
    return !sessionStorage.getItem(storageKey);
  });

  const markAsSeen = () => {
    if (!import.meta.client) return;
    if (!noticeData.value) return;

    const updatedAt = noticeData.value.updatedAt;
    const storageKey = `notice-seen-${updatedAt}`;

    sessionStorage.setItem(storageKey, 'true');
  };

  return {
    notice: noticeData,
    isEnabled,
    shouldShowPopup,
    markAsSeen,
    refresh,
  };
};
