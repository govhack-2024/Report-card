use elevation::get_elevation;
use num_rational::Rational64;

pub mod data;
pub mod street_search;
pub mod elevation;
pub mod config;

#[tokio::main]
async fn main() {
    
    println!("{} meters", get_elevation(data::LatLon { lat: -35.7385751145524, lon: 174.34708834650175 }).await.unwrap());
}
