export default defineAppConfig({
  // https://ui.nuxt.com/getting-started/theme#design-system
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'zinc',
    },
    button: {
      defaultVariants: {
        color: 'neutral',
      },
    },
    input: {
      defaultVariants: {
        color: 'neutral',
      },
      slots: {
        root: 'w-full',
      },
    },
    textarea: {
      defaultVariants: {
        color: 'neutral',
      },
      slots: {
        root: 'w-full',
      },
    },
    badge: {
      defaultVariants: {
        color: 'neutral',
      },
    },
    navigationMenu: {
      defaultVariants: {
        color: 'neutral',
      },
    },
    toast: {
      defaultVariants: {
        color: 'neutral',
      },
    },
  },
});
