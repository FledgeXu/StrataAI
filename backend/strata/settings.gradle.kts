rootProject.name = "strata"

// `authentication` is a bounded context module. `app` only boots and assembles modules.
include("authentication")
include("app")
