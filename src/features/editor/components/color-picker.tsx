import dynamic from 'next/dynamic';
// import { ChromePicker, CirclePicker } from "react-color";

import { colors } from "@/features/editor/types";
import { rgbaObjectToString } from "@/features/editor/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
};

// Need dynamic import, because react-color doesn't support SSR
const CirclePickerCmp = dynamic(
  () => import('react-color').then((mod) => mod.CirclePicker),
  { 
    ssr: false,
    loading: () => <div>Loading color picker...</div>
  }
);


const ChromePickerCmp = dynamic(
  () => import('react-color').then((mod) => mod.ChromePicker),
  { ssr: false }
);

export const ColorPicker = ({
  value,
  onChange,
}: ColorPickerProps) => {
  return (
    <div className="w-full space-y-4" suppressHydrationWarning>
      <ChromePickerCmp
        color={value}
        onChange={(color) => {
          const formattedValue = rgbaObjectToString(color.rgb);
          onChange(formattedValue);
        }}
        className="border rounded-lg"
      />
      <CirclePickerCmp
        color={value}
        colors={colors}
        onChangeComplete={(color) => {
          const formattedValue = rgbaObjectToString(color.rgb);
          onChange(formattedValue);
        }}
      />
    </div>
  );
};
