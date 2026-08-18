export default function getNewOrder(moved, list) {
  const DIRECTION_UP = -0.5;
  const DIRECTION_DOWN = 0.5;
  const direction = moved.newIndex > moved.oldIndex ? DIRECTION_DOWN : DIRECTION_UP;
  const order = list[moved.newIndex].ordering;
  const newOrder = order + direction;
  return newOrder;
}
