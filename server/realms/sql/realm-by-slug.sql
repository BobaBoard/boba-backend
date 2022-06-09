 SELECT 
    realms.string_id AS realm_id,
    realms.slug AS realm_slug,
    icon_reference_id AS realm_icon_url,
    favicon_reference_id AS realm_favicon_url,
    realms.title AS realm_title,
    realms.description AS realm_description,
    realms.feedback_form_url AS realm_feedback_form_url,
    COALESCE(
        array_to_json(
            (array_agg(rule_blocks) FILTER (WHERE rule_blocks IS NOT null))
            || -- concatenate all rules blocks
            (array_agg(subscription_blocks) FILTER (WHERE subscription_blocks IS NOT null))),
    '[]'::json
    ) AS homepage_blocks
FROM realms 
    LEFT JOIN realm_homepage_blocks AS rhb
        ON realms.id = rhb.realm_id 
    LEFT JOIN (
            SELECT 
                blocks.id,
                blocks.string_id,
                blocks.title,
                blocks.index,
                blocks.type,
                array_to_json(array_agg(rules)) AS rules
            FROM blocks
                JOIN block_rules AS br 
                ON br.block_id = blocks.id 
                JOIN rules
                ON br.rule_id = rules.id
            WHERE blocks.type = 'rules'
            GROUP BY blocks.id, blocks.string_id, blocks.title, blocks.index, blocks.type
        ) AS rule_blocks
    ON rhb.block_id = rule_blocks.id
    LEFT JOIN (
            SELECT 
                blocks.id,
                blocks.string_id,
                blocks.title,
                blocks.index,
                blocks.type,
                subscriptions.string_id as subscription_id
            FROM blocks
                JOIN block_subscriptions AS bs
                ON bs.block_id = blocks.id
                JOIN subscriptions
                ON bs.subscription_id = subscriptions.id
        ) AS subscription_blocks
    ON rhb.block_id = subscription_blocks.id
WHERE slug = $/realm_slug/
GROUP BY realms.string_id, realms.slug, icon_reference_id, favicon_reference_id, realms.title, realms.description, realms.feedback_form_url ;