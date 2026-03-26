import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";

// Ensure all icon libraries are available
library.add(fas, far, fab);

// Common icon mappings for fallback
const iconMappings = {
  // Common e-commerce icons
  "shopping-cart": "fas fa-shopping-cart",
  cart: "fas fa-shopping-cart",
  user: "fas fa-user",
  home: "fas fa-home",
  search: "fas fa-search",
  heart: "fas fa-heart",
  star: "fas fa-star",
  phone: "fas fa-phone",
  envelope: "fas fa-envelope",
  "map-marker": "fas fa-map-marker-alt",
  truck: "fas fa-truck",
  "credit-card": "fas fa-credit-card",
  shield: "fas fa-shield-alt",
  clock: "fas fa-clock",
  check: "fas fa-check",
  times: "fas fa-times",
  plus: "fas fa-plus",
  minus: "fas fa-minus",
  "arrow-right": "fas fa-arrow-right",
  "arrow-left": "fas fa-arrow-left",
  "chevron-right": "fas fa-chevron-right",
  "chevron-left": "fas fa-chevron-left",
  menu: "fas fa-bars",
  close: "fas fa-times",
  edit: "fas fa-edit",
  delete: "fas fa-trash",
  settings: "fas fa-cog",
  dashboard: "fas fa-tachometer-alt",
  orders: "fas fa-shopping-bag",
  wishlist: "fas fa-heart",
  address: "fas fa-map-marker-alt",
  payment: "fas fa-credit-card",
  support: "fas fa-headset",
  message: "fas fa-comment",
  logout: "fas fa-sign-out-alt",
  password: "fas fa-lock",
  people: "fas fa-users",
  review: "fas fa-star",
  love: "fas fa-heart",
};

function FontAwesomeCom({ icon, size, className }) {
  // Handle cases where icon prop is undefined or null
  if (!icon) {
    console.warn("FontAwesomeCom: icon prop is missing or undefined");
    return null;
  }

  try {
    // Handle different icon formats
    let prefix, iconName;

    if (typeof icon === "string") {
      // Check if it's already in FontAwesome format
      if (icon.includes(" ")) {
        const text = icon.split(" ");

        // Handle cases where icon format is incorrect
        if (text.length < 2) {
          console.warn(
            `FontAwesomeCom: Invalid icon format "${icon}". Expected format: "fas fa-home"`
          );
          return null;
        }

        prefix = text[0]; // fas, far, fab
        iconName = text[1].replace("fa-", "");
      } else {
        // Handle single word icons (e.g., "home", "user")
        const mappedIcon = iconMappings[icon.toLowerCase()];
        if (mappedIcon) {
          const text = mappedIcon.split(" ");
          prefix = text[0];
          iconName = text[1].replace("fa-", "");
        } else {
          // Try to use as a solid icon
          prefix = "fas";
          iconName = icon.replace("fa-", "");
        }
      }
    } else if (Array.isArray(icon)) {
      // Handle case where icon is already an array [prefix, iconName]
      [prefix, iconName] = icon;
    } else {
      console.warn(
        `FontAwesomeCom: Invalid icon type. Expected string or array, got ${typeof icon}`
      );
      return null;
    }

    // Create the icon array for FontAwesome
    const iconArray = [prefix, iconName];

    // Check if the icon exists in the library
    const iconExists =
      library.definitions[prefix] && library.definitions[prefix][iconName];

    if (!iconExists) {
      console.warn(`FontAwesomeCom: Icon "${icon}" not found in library.`, {
        originalIcon: icon,
        prefix,
        iconName,
        availablePrefixes: Object.keys(library.definitions),
        availableIconsInPrefix: library.definitions[prefix]
          ? Object.keys(library.definitions[prefix]).slice(0, 10)
          : [],
      });

      // Try to find a similar icon or use a fallback
      const fallbackIcon = findFallbackIcon(iconName);
      if (fallbackIcon) {
        console.info(
          `FontAwesomeCom: Using fallback icon "${fallbackIcon}" for "${icon}"`
        );
        return (
          <FontAwesomeIcon
            className={className}
            icon={fallbackIcon}
            size={size}
          />
        );
      }

      return null;
    }

    return (
      <FontAwesomeIcon className={className} icon={iconArray} size={size} />
    );
  } catch (error) {
    console.error("FontAwesomeCom: Error rendering icon:", error, { icon });
    return null;
  }
}

// Helper function to find fallback icons
function findFallbackIcon(iconName) {
  // Try to find similar icons in the library
  const commonFallbacks = {
    home: ["fas", "home"],
    user: ["fas", "user"],
    cart: ["fas", "shopping-cart"],
    "shopping-cart": ["fas", "shopping-cart"],
    heart: ["fas", "heart"],
    star: ["fas", "star"],
    search: ["fas", "search"],
    phone: ["fas", "phone"],
    envelope: ["fas", "envelope"],
    "map-marker": ["fas", "map-marker-alt"],
    truck: ["fas", "truck"],
    "credit-card": ["fas", "credit-card"],
    shield: ["fas", "shield-alt"],
    clock: ["fas", "clock"],
    check: ["fas", "check"],
    times: ["fas", "times"],
    plus: ["fas", "plus"],
    minus: ["fas", "minus"],
    "arrow-right": ["fas", "arrow-right"],
    "arrow-left": ["fas", "arrow-left"],
    "chevron-right": ["fas", "chevron-right"],
    "chevron-left": ["fas", "chevron-left"],
    menu: ["fas", "bars"],
    close: ["fas", "times"],
    edit: ["fas", "edit"],
    delete: ["fas", "trash"],
    settings: ["fas", "cog"],
    dashboard: ["fas", "tachometer-alt"],
    orders: ["fas", "shopping-bag"],
    wishlist: ["fas", "heart"],
    address: ["fas", "map-marker-alt"],
    payment: ["fas", "credit-card"],
    support: ["fas", "headset"],
    message: ["fas", "comment"],
    logout: ["fas", "sign-out-alt"],
    password: ["fas", "lock"],
    people: ["fas", "users"],
    review: ["fas", "star"],
    love: ["fas", "heart"],
  };

  // Try exact match first
  if (commonFallbacks[iconName]) {
    return commonFallbacks[iconName];
  }

  // Try partial match
  for (const [key, value] of Object.entries(commonFallbacks)) {
    if (iconName.includes(key) || key.includes(iconName)) {
      return value;
    }
  }

  // Default fallback
  return ["fas", "question-circle"];
}

export default FontAwesomeCom;
