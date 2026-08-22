export const Fragment = Symbol('Fragment');
export const createAstro = () => ({});
export const createComponent = (factory) => factory;
export const createMetadata = () => ({});

const unusedRenderHelper = () => {
  throw new Error('Test témat nesmí spustit render šablony.');
};

export const addAttribute = unusedRenderHelper;
export const defineScriptVars = unusedRenderHelper;
export const defineStyleVars = unusedRenderHelper;
export const maybeRenderHead = unusedRenderHelper;
export const mergeSlots = unusedRenderHelper;
export const render = unusedRenderHelper;
export const renderComponent = unusedRenderHelper;
export const renderHead = unusedRenderHelper;
export const renderScript = unusedRenderHelper;
export const renderSlot = unusedRenderHelper;
export const renderTransition = unusedRenderHelper;
export const createTransitionScope = unusedRenderHelper;
export const spreadAttributes = unusedRenderHelper;
export const unescapeHTML = unusedRenderHelper;
