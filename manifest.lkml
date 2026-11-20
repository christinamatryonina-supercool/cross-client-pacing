# manifest.lkml — project cross--client-pacing
# Registers the Data App so its code lives in this project.
# Compare with the Yelp project's manifest.lkml and copy its entitlements
# block exactly if it differs (that one is proven to work on this instance).

project_name: "cross--client-pacing"

application: dept_cross_client_pulse {
  label: "DEPT Cross-Client Pulse"
  file: "dept_cross_client_pulse.js"

  mount_points: {
    dashboard_tile: yes
    standalone: yes
  }

  entitlements: {
    core_api_methods: ["run_inline_query", "me", "all_lookml_models", "lookml_model_explore", "dashboard", "dashboard_element"]
    use_embeds: no
    use_form_submit: no
    use_downloads: no
    new_window: yes
    external_api_urls: ["https://www.gstatic.com"]
  }
}
