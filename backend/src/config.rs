use std::env;

use log::info;
use once_cell::sync::Lazy;




pub struct EnvConfig {
    pub lris_portal_api_key: String,
}

pub static CONFIG: Lazy<EnvConfig> = Lazy::new(|| {
    if dotenv::dotenv().is_err() {
        info!("No .env file found");
    }

    EnvConfig {
        lris_portal_api_key: env::var("LRIS_API_KEY")
            .expect("Missing LRIS_API_KEY environment variable. Make an account at https://lris.scinfo.org.nz/ and get an API key."),
    }
});