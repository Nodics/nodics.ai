# Functional module registry

The registry separates durable project decisions from ephemeral runtime
observations. Restarting a server renews its runtime lease but does not ask the
operator to register the functional module again.

Core and Platform are protected for a Platform runtime. Optional functional
modules move through available, registered, active, inactive, and deregistered
operator decisions without hot-loading or unloading server code.

