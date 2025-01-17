package item

import rego.v1

# Default deny policy
default allow_create := false

allow_create if {
	input.action == "create"
	input.resource.type == "item"
	input.resource.model.owner_id == input.user.id
}
