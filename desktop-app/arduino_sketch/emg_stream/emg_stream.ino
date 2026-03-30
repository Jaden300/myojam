void setup() {
  Serial.begin(9600);
}

void loop() {
  int val = analogRead(A0);  // MyoWare outputs to A0 via shield
  float normalized = (val / 1023.0) - 0.5;
  Serial.println(normalized);
  delayMicroseconds(6000);  // ~200 Hz
}