---
- dashboard: dept_cross_client_pulse
  title: "DEPT Cross-Client Pulse"
  description: "Internal paid-media pulse across all clients and platforms, with data-flow health."
  layout: newspaper
  preferred_viewer: dashboards-next
  crossfilter_enabled: false
  elements:
  - name: pulse_app
    title: "DEPT Cross-Client Pulse"
    title_hidden: true
    type: extension
    extension_id: "cross--client-pacing::dept_cross_client_pulse"
    row: 0
    col: 0
    width: 24
    height: 60
