package item

test_post_allowed {
	allow_create with input as {
		"action": "create",
		"user": {"id": "123"},
		"resource": {
			"type": "item",
			"model": {"owner_id": "123"},
		},
	}
}
