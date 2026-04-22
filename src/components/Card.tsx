/**
 * Card component for e-ink display.
 * High-contrast bordered cards with no blur/shadow effects.
 */
import React from 'react';
import { Pressable, Text, View, ViewProps, StyleSheet } from 'react-native';
import { EINK_COLORS, EINK_SPACING, MIN_TOUCH_TARGET } from '../lib/theme';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewProps['style'];
}

const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  ...props
}) => {
  const content = (
    <View
      style={StyleSheet.compose(
        {
          backgroundColor: EINK_COLORS.dark.card,
          borderWidth: 2,
          borderColor: EINK_COLORS.dark.cardBorder,
          padding: EINK_SPACING.md,
          minHeight: MIN_TOUCH_TARGET,
        },
        style
      )}
      {...props}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ([
          content.props.style,
          { outlineOffset: 2 },
        ])}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

export interface BookCardProps {
  title: string;
  author?: string;
  coverUri?: string;
  onPress?: () => void;
  badge?: string;
}

export const BookCard: React.FC<BookCardProps> = ({ title, author, coverUri, onPress, badge }) => {
  const colors = EINK_COLORS.dark;
  const spacing = EINK_SPACING;

  return (
    <Card onPress={onPress}>
      {badge && (
        <View
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.sm,
            paddingVertical: 2,
            alignSelf: 'flex-start',
            marginBottom: spacing.sm,
          }}
        >
          <Text
            style={{
              color: colors.background,
              fontSize: 12,
              fontWeight: 'bold',
            }}
          >
            {badge}
          </Text>
        </View>
      )}

      <View style={{ marginBottom: spacing.sm }}>
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: spacing.xs,
          }}
        >
          {title}
        </Text>
        {author && (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 13,
            }}
          >
            {author}
          </Text>
        )}
      </View>

      <View
        style={{
          height: 200,
          backgroundColor: '#CCCCCC',
          borderWidth: 1,
          borderColor: '#000000',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {coverUri ? (
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#DDDDDD',
            }}
          />
        ) : (
          <Text style={{ color: '#666666', fontSize: 14 }}>No Cover</Text>
        )}
      </View>
    </Card>
  );
};

export interface CollectionCardProps {
  title: string;
  bookCount?: number;
  onPress?: () => void;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ title, bookCount, onPress }) => {
  const colors = EINK_COLORS.dark;
  const spacing = EINK_SPACING;

  return (
    <Card onPress={onPress}>
      <Text
        style={{
          color: colors.text,
          fontSize: 16,
          fontWeight: 'bold',
          marginBottom: spacing.xs,
        }}
      >
        {title}
      </Text>
      {bookCount != null && (
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
          {bookCount} books
        </Text>
      )}
    </Card>
  );
};

export default Card;