from flask import Flask, jsonify

app = Flask(__name__)

# List to store captured packets information
captured_packets = []

@app.route('/')
def hello():
    return 'Hello, World!'

@app.route('/capture')
def packet_capture():
    # Import required modules here to avoid import issues
    import requests
    from scapy.all import sniff, IP

    API_KEY = 'c6542107b1daad'

    def packet_callback(packet):
        if IP in packet:
            src_ip = packet[IP].src
            dst_ip = packet[IP].dst
            src_location = get_location_info(src_ip)
            dst_location = get_location_info(dst_ip)

            # Add captured information to the list
            captured_packets.append({
                'src_ip': src_ip,
                'dst_ip': dst_ip,
                'src_location': src_location,
                'dst_location': dst_location
            })

    def get_location_info(ip):
        try:
            print(f"Retrieving location for IP {ip}")
            response = requests.get(f"http://ipinfo.io/{ip}?token={API_KEY}")
            data = response.json()
            print(f"Location for IP {ip} is {data['loc']}")
            if 'loc' in data:
                lat, lon = data['loc'].split(',')
                return f"Latitude: {lat}, Longitude: {lon}"
            else:
                return f"Location information not available for IP {ip}"
        except Exception as e:
            return f"Error retrieving location for IP {ip}: {e}"

    # Sniff the network for 10 packets and call packet_callback for each packet
    sniff(prn=packet_callback, count=10)

    # Return the captured_packets list as JSON
    return jsonify(captured_packets)

if __name__ == '__main__':
    app.run(debug=True)


