const getRealmBySlug = `
    SELECT * FROM realms WHERE slug = $/realm_slug/`;

export default {
  getRealmBySlug,
};
