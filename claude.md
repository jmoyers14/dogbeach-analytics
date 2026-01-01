# Coding Conventions

## Class Structure
Classes should be organized in the following order:

1. **Instance variables** - All instance properties
2. **Constructor** - Class constructor
3. **Public methods** - Alphabetically ordered
4. **Private methods** - Alphabetically ordered, marked with `private` keyword

## Naming Conventions
- **Interfaces**: Use descriptive names with `Document` suffix for Mongoose models (e.g., `ProjectDocument`, `EventDocument`)
- **Models**: Use plain names (e.g., `Project`, `Event`)
- **No Hungarian notation**: Avoid prefixes like `I` for interfaces

## General Guidelines
- Use explicit `private` keyword for private methods
- Alphabetize methods within their access level sections
- Keep code clean and well-organized
