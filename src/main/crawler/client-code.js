// write in js format to avoid eslint and ts warning

export async function getStorybookMetadata(page) {
  try {
    await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.storyStoreValue, {
      timeout: 30000,
    });

    await page.evaluate(async () => {
      const api = window.__STORYBOOK_PREVIEW__;
      await api.storyStoreValue?.cacheAllCSFFiles();
    });

    const result = await page.evaluate(async () => {
      const rawData = await window.__STORYBOOK_PREVIEW__.storyStoreValue.extract();
      return Object.values(rawData).map(x => ({
        id: x.id,
        componentId: x.componentId,
        title: x.title,
        kind: x.kind,
        tags: x.tags,
        name: x.name,
        story: x.story,
      }));
    });
    return { result };
  } catch (error) {
    return { error };
  }
}
