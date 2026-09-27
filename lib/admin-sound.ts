let context: AudioContext | null = null;
export function adminSoundEnabled() { return context?.state === "running"; }
export async function enableAdminSound() {
  context ||= new AudioContext();
  await context.resume();
  playAdminSound();
  return context.state === "running";
}
export function playAdminSound() {
  if (!context || context.state !== "running") return;
  const now = context.currentTime;
  [660, 880].forEach((frequency, index) => {
    const oscillator = context!.createOscillator();
    const gain = context!.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, now + index * 0.2);
    gain.gain.linearRampToValueAtTime(0.16, now + index * 0.2 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.2 + 0.3);
    oscillator.connect(gain); gain.connect(context!.destination);
    oscillator.start(now + index * 0.2); oscillator.stop(now + index * 0.2 + 0.32);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  });
}
