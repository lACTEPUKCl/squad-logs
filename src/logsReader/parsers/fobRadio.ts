let lastRadio: { chainID: string; radioId: string } | null = null;

export const fobRadioCapture = (line: string) => {
  const m = line.match(
    /\[([0-9.:-]+)]\[([ 0-9]*)].*?SetReplicates called on non-initialized actor BP_FOBRadio_[A-Za-z0-9]+_C_(\d+)/i,
  );

  if (m) {
    lastRadio = { chainID: m[2], radioId: m[3] };
  }

  return null;
};

export const takeFobRadio = (chainID: string): string | null => {
  if (lastRadio && lastRadio.chainID === chainID) {
    const id = lastRadio.radioId;
    lastRadio = null;
    return id;
  }
  return null;
};
