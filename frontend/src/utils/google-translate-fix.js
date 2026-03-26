export default function applyGoogleTranslateDOMPatch() {
  if (typeof Node === "function" && Node.prototype) {
    const originalRemoveChild = Node.prototype.removeChild;

    Node.prototype.removeChild = function (child) {
      if (child.parentNode !== this) {
        console.warn(
          "Google Translate attempted to remove a child node from the wrong parent. Skipping.",
          {
            childNode: child?.nodeName,
            expectedParent: this?.nodeName,
            actualParent: child?.parentNode?.nodeName,
          }
        );
        return child;
      }

      return originalRemoveChild.apply(this, arguments);
    };

    const originalInsertBefore = Node.prototype.insertBefore;

    Node.prototype.insertBefore = function (newNode, referenceNode) {
      if (referenceNode && referenceNode.parentNode !== this) {
        console.warn(
          "Google Translate attempted to insert before a reference node from the wrong parent. Skipping.",
          {
            newNode: newNode?.nodeName,
            expectedParent: this?.nodeName,
            actualParent: referenceNode?.parentNode?.nodeName,
          }
        );
        return newNode;
      }

      return originalInsertBefore.apply(this, arguments);
    };
  }
}
