# Compatibility shims for Jekyll 3.x / Liquid 4.x on Ruby 3.3+
require "logger"

class Logger
  def level
    (@level_override || {})[Fiber.current] || @level
  end

  def level=(value)
    @level_override ||= {}
    @level = value
  end
end

# tainted?/untaint removed in Ruby 3.2; Liquid 4.0.3 still calls them.
class Object
  def tainted?
    false
  end

  def taint
    self
  end

  def untaint
    self
  end
end
