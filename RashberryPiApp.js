import paho.mqtt.client as mqtt
import time
import random

# MQTT Broker Details
broker_address = "raspberrypi.local"
topic_voltage = "solar/voltage"
topic_smoke = "solar/smoke"
topic_energy = "solar/energy"
topic_maintenance = "solar/maintenance"
topic_impact = "solar/impact"
topic_microgrid = "solar/microgrid"
topic_emergency = "solar/emergency"

# MQTT Client Setup
client = mqtt.Client("SolarPiPublisher")
client.connect(broker_address)

# Function to simulate sensor data
def publish_sensor_data():
    voltage = random.uniform(220, 260)  # Voltage sensor reading
    smoke = random.uniform(0, 10)       # Smoke sensor reading
    energy = random.uniform(0, 100)     # Energy consumption reading
    impact = random.uniform(0, 10)      # Environmental impact

    # Publish messages
    client.publish(topic_voltage, str(voltage))
    client.publish(topic_smoke, str(smoke))
    client.publish(topic_energy, str(energy))
    client.publish(topic_impact, str(impact))

    # Emergency Alerts
    if voltage > 250 or smoke > 5:
        client.publish(topic_emergency, "Critical Alert: Voltage/Smoke High")
    else:
        client.publish(topic_emergency, "Safe")

while True:
    publish_sensor_data()
    time.sleep(2)
