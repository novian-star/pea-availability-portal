type NoticeResponse = {
  data: {
    id: string;
    title: string | null;
    content: string | null;
    isEnabled: boolean;
    showInBanner: boolean;
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

  const showInBanner = computed(() => noticeData.value?.showInBanner || false);

  const shouldShowInBanner = computed(() => {
    return isEnabled.value && showInBanner.value && noticeData.value;
  });

  const truncateContent = (content: string | null, maxLength: number = 120): string => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const bannerMessage = computed(() => {
    if (!shouldShowInBanner.value || !noticeData.value) return null;
    const truncated = truncateContent(noticeData.value.content);
    return `${noticeData.value.title}: ${truncated}`;
  });

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
    showInBanner,
    shouldShowInBanner,
    shouldShowPopup,
    bannerMessage,
    truncateContent,
    markAsSeen,
    refresh,
  };
};
