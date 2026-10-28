import { View } from 'react-native';

import { makeStyles } from '../theme';

/** Hairline separator. The only use of `border`. */
export function Divider({ inset = false }: { inset?: boolean }) {
  const styles = useStyles();
  return <View style={[styles.line, inset && styles.inset]} />;
}

const useStyles = makeStyles((t) => ({
  line: { height: t.hairline, backgroundColor: t.colors.border },
  inset: { marginLeft: t.space.md },
}));
