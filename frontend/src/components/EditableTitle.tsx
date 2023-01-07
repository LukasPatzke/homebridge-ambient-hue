import { createStyles, Group, TextInput, Title } from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';
import { FC, ReactNode, useEffect, useState } from 'react';

const useStyles = createStyles((theme) => ({
  input: {
    fontSize: theme.headings.sizes.h1.fontSize,
    lineHeight: theme.headings.sizes.h1.lineHeight,
    fontWeight: 700,
    height: 46,
    width: '100%',
  },
  root: {
    // display: 'inline',
    flexShrink: 1,
    flexGrow: 1,
  },
}));
interface EditableTextProps {
  value: string;
  editable?: boolean;
  rightElement?: ReactNode;
  onChange?: (value: string) => Promise<void>;
}

export const EditableTitle: FC<EditableTextProps> = ({
  value,
  editable,
  rightElement,
  onChange,
}) => {
  const { classes } = useStyles();
  const [isEditable, setEditable] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const ref = useClickOutside<HTMLInputElement>(() => finish());

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const finish = () => {
    if (onChange) {
      onChange(inputValue).then(() => setEditable(false));
    } else {
      setEditable(false);
    }
  };

  if (isEditable && editable) {
    return (
      <TextInput
        ref={ref}
        classNames={classes}
        autoFocus
        value={inputValue}
        onChange={(event) => setInputValue(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            finish();
          }
        }}
      />
    );
  }

  return (
    <Group position="apart" noWrap>
      <Title onClick={() => setEditable(true)}>{value}</Title>
      {rightElement}
    </Group>
  );
};
