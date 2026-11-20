# Define the database connection to be used for this model.
connection: "snowflake-dwh"

# include all the views
include: "/views/**/*.view.lkml"

datagroup: cross_client_pacing_default_datagroup {
  # sql_trigger: SELECT MAX(id) FROM etl_log;;
  max_cache_age: "1 hour"
}

persist_with: cross_client_pacing_default_datagroup

explore: cross_channel_autopacing_perf_looker_dtable {}
