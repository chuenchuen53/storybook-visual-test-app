// write in js format to avoid eslint and ts warning

export async function getStorybookMetadata(page) {
  try {
    await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.storyStoreValue, {
      timeout: 30000,
    });

    await page.evaluate(async () => {
      await window.__STORYBOOK_PREVIEW__.storyStoreValue?.cacheAllCSFFiles();
    });

    const result = await page.evaluate(async () => {
      const rawData = await window.__STORYBOOK_PREVIEW__.storyStoreValue.extract();
      return Object.values(rawData).map(x => ({
        id: x.id,
        title: x.title,
        name: x.name,
        tags: x.tags,
      }));
    });
    return { result };
  } catch (error) {
    return { error };
  }
}
